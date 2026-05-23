"""
PromptForge backend — FastAPI (production-ready, no MongoDB).
Required env vars:
  - EMERGENT_LLM_KEY
  - CORS_ORIGINS (comma-separated, e.g. https://your-app.vercel.app)
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


# ---- Compact, execution-focused rules ----
RULES_CONTEXT = """\
You are an elite Prompt Engineer. Your job is to rewrite a user's raw prompt
into a short, execution-driven prompt for ChatGPT, Claude, or Gemini.

CORE PRINCIPLE — EXECUTION, NOT ADVICE:
The optimized prompt must command the target model to PRODUCE THE
DELIVERABLE DIRECTLY. It must never:
  - explain the topic
  - teach the user about it
  - role-play AS the thing being built (e.g. if user wants "an app that does
    X", the prompt must order the model to BUILD it / OUTPUT IT — not to
    behave as that app)
  - ask the user clarifying questions before producing the result
  - offer multiple options unless explicitly asked

VOICE: imperative, second-person, terse. Use verbs like
PRODUCE, BUILD, GENERATE, WRITE, OUTPUT, DELIVER, RETURN.
NEVER use: "help with", "explain", "discuss", "consider", "you could",
"would you like".

LENGTH: aim for the MINIMUM tokens that fully specify the deliverable.
Hard cap ~250 words. Cut filler, redundancy, and motivational text.

MODEL SHAPES (use the one requested):

ChatGPT — compact Markdown:
  Role: <one line>
  Task: <one sentence — what to PRODUCE>
  Requirements:
  - <bullet>
  - <bullet>
  Output: <exact artifact: code file / table / JSON / document section>
  Constraints: <only the non-obvious ones>

Claude — compact XML:
  <role>one line</role>
  <task>one sentence — what to PRODUCE</task>
  <requirements>
  - bullet
  - bullet
  </requirements>
  <output>exact artifact spec</output>
  <constraints>only non-obvious rules</constraints>

Gemini — compact hierarchical:
  Goal: <what to PRODUCE in one sentence>
  Requirements:
  - bullet
  - bullet
  Output: <exact artifact>
  Constraints: <non-obvious rules>
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
        "2. Restate the user's intent in 1-3 short sentences IN THAT "
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
        "chatgpt": "Compact Markdown: Role / Task / Requirements / Output / Constraints.",
        "claude": "Compact XML: <role>, <task>, <requirements>, <output>, <constraints>.",
        "gemini": "Compact hierarchical: Goal / Requirements / Output / Constraints.",
    }[req.model]

    lang_instruction = (
        f"Write all natural-language content in {req.output_language}. "
        f"Keep structural tokens (XML tag names, section labels like 'Role:', "
        f"'Goal:', '<task>') in English."
    )

    system = (
        RULES_CONTEXT
        + "\n\nSTRICT OUTPUT RULES:\n"
        "1. Return ONLY the final optimized prompt. No preamble, no "
        "explanation, no closing remarks, no surrounding code fences.\n"
        "2. Hard cap: ~250 words. Cut every word that is not essential.\n"
        "3. The prompt MUST command the target model to PRODUCE the "
        "deliverable directly — never to explain, teach, role-play, or ask "
        "clarifying questions.\n"
        "4. Be concrete about WHAT to output (file/format/length/structure).\n"
        "5. Preserve the user's actual subject; do not invent contradicting "
        "facts. You may add reasonable defaults for missing fields.\n"
        f"6. {lang_instruction}\n"
    )

    user_msg_text = (
        f"TARGET MODEL: {req.model.upper()}\n"
        f"REQUIRED SHAPE: {model_shape}\n\n"
        f'USER\'S RAW REQUEST:\n"""\n{req.prompt}\n"""\n\n'
        "Produce the optimized prompt now. Remember: execution-oriented, "
        "<=250 words, no preamble."
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
