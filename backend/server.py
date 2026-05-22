"""
PromptForge backend — FastAPI

Production-ready for Render.com deployment.
Required env vars:
  - EMERGENT_LLM_KEY   (your Emergent Universal Key)
  - CORS_ORIGINS       (comma-separated, e.g. https://your-app.vercel.app)
Optional:
  - PORT               (Render sets this automatically; default 8001 locally)
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
import json
import re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Literal

from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

EMERGENT_LLM_KEY = os.environ["EMERGENT_LLM_KEY"]
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

app = FastAPI(title="PromptForge API", version="1.0.0")
api_router = APIRouter(prefix="/api")


# ---- Models ----
TargetModel = Literal["chatgpt", "claude", "gemini"]


class AnalyzeRequest(BaseModel):
    model: TargetModel
    prompt: str = Field(..., min_length=1)


class AnalyzeResponse(BaseModel):
    interpretation: str
    detected_language: str
    detected_language_code: str


class OptimizeRequest(BaseModel):
    model: TargetModel
    prompt: str = Field(..., min_length=1)
    output_language: str = Field(..., min_length=1)


class OptimizeResponse(BaseModel):
    optimized_prompt: str


# ---- Prompt engineering rules ----
RULES_CONTEXT = """
You are a Prompt Engineering expert that has FULLY internalized guidelines
for ChatGPT (OpenAI), Claude (Anthropic), and Gemini (Google).

CHATGPT — Markdown sections (# Role / ## Context / ## Task / ## Constraints
/ ## Output Format / ## Quality Check). Hard rules. Format first.

CLAUDE — XML tags (<role>, <context>, <task>, <constraints>, <thinking>,
<format>). Encourage step-by-step thinking. Natural language clarity.

GEMINI — Hierarchical: Topic → Domain → Goal → Task (numbered) →
Instructions (bullets) → Deliverables → Sources & Verification.

GOLDEN RULES:
- Clarity beats complexity.
- Specificity > vagueness.
- Constraints improve consistency.
- Explicit output format reduces hallucinations.
- Ask the model to verify before finalizing.
"""


def _build_chat(session_id: str, system_message: str) -> LlmChat:
    return LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message,
    ).with_model("openai", "gpt-5.1")


@api_router.get("/")
async def root():
    return {"message": "PromptForge API is running", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


@api_router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(req: AnalyzeRequest):
    system = (
        "You are a prompt-engineering analyst. Do TWO things:\n"
        "1. Detect the natural language of the user's prompt.\n"
        "2. Restate the user's intent in 1–3 short, plain sentences IN THAT "
        "SAME DETECTED LANGUAGE. Focus on: goal, audience/domain if implied, "
        "expected output. Do NOT rewrite the prompt. Do NOT add commentary.\n\n"
        "Return STRICT JSON only (no markdown fences):\n"
        '{"detected_language": "<English name, e.g. Arabic, English, French>", '
        '"detected_language_code": "<ISO 639-1, e.g. ar, en, fr>", '
        '"interpretation": "<1-3 sentences in the detected language>"}'
    )

    chat = _build_chat(session_id=str(uuid.uuid4()), system_message=system)
    user_msg = UserMessage(
        text=(
            f"Target model: {req.model}\n"
            f'User\'s raw prompt:\n"""\n{req.prompt}\n"""\n\n'
            "Return the JSON now."
        )
    )

    try:
        response = await chat.send_message(user_msg)
    except Exception as e:
        logging.exception("analyze failed")
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    raw = str(response).strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)

    try:
        data = json.loads(raw)
        return AnalyzeResponse(
            interpretation=str(data["interpretation"]).strip(),
            detected_language=str(data.get("detected_language", "English")).strip(),
            detected_language_code=str(
                data.get("detected_language_code", "en")
            ).strip().lower(),
        )
    except Exception:
        return AnalyzeResponse(
            interpretation=raw,
            detected_language="English",
            detected_language_code="en",
        )


@api_router.post("/optimize", response_model=OptimizeResponse)
async def optimize_prompt(req: OptimizeRequest):
    model_shape = {
        "chatgpt": (
            "Output a MARKDOWN-structured prompt with sections: "
            "# Role, ## Context, ## Task (numbered), ## Constraints (bullets), "
            "## Output Format, ## Quality Check."
        ),
        "claude": (
            "Output an XML-tagged prompt using these tags: "
            "<role>, <context>, <task> (with numbered steps), <constraints>, "
            "<thinking>, <format>. Tags must be on their own lines."
        ),
        "gemini": (
            "Output a HIERARCHICAL prompt with these top-level blocks: "
            "Topic, Domain, Goal, Task (numbered), Instructions (bullets), "
            "Deliverables (bullets), Sources & Verification."
        ),
    }[req.model]

    lang_instruction = (
        f"All natural-language content inside the prompt MUST be written in "
        f"{req.output_language}. Keep structural tokens (tag names like "
        f"<role>, section headers like '# Role' or 'Topic:') in their "
        f"original English form, but their contents must be in "
        f"{req.output_language}."
    )

    system = (
        RULES_CONTEXT
        + "\n\nYour job: rewrite the user's raw prompt into a polished, "
        "production-ready prompt that PERFECTLY follows the target model's "
        "preferred shape.\n\n"
        "STRICT OUTPUT RULES:\n"
        "1. Return ONLY the final optimized prompt — no preamble, no "
        "explanation, no closing remarks, no code fences.\n"
        "2. Preserve the user's actual subject matter; do NOT invent facts "
        "that contradict them. You MAY add reasonable defaults for missing "
        "structural fields inferred from their intent.\n"
        "3. Keep it concise and practical, not bloated.\n"
        f"4. {lang_instruction}\n"
    )

    user_msg_text = (
        f"TARGET MODEL: {req.model.upper()}\n"
        f"REQUIRED SHAPE: {model_shape}\n\n"
        f'USER\'S RAW PROMPT:\n"""\n{req.prompt}\n"""\n\n'
        "Now produce the optimized prompt."
    )

    chat = _build_chat(session_id=str(uuid.uuid4()), system_message=system)
    try:
        response = await chat.send_message(UserMessage(text=user_msg_text))
    except Exception as e:
        logging.exception("optimize failed")
        raise HTTPException(status_code=500, detail=f"LLM error: {e}")

    return OptimizeResponse(optimized_prompt=str(response).strip())


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
