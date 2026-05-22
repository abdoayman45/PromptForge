export const translations = {
  en: {
    appName: "PromptForge",
    tagline: "Turn rough ideas into model-perfect prompts.",
    description:
      "Pick your target AI, paste a draft, confirm what you mean, and copy a prompt engineered for ChatGPT, Claude, or Gemini.",
    steps: {
      pickModel: "Pick Model",
      writePrompt: "Write Prompt",
      confirmIntent: "Confirm Intent",
      result: "Optimized Prompt",
    },
    pickModelTitle: "Which model are you targeting?",
    pickModelSubtitle:
      "Each model is tuned by different rules. We optimize for the one you choose.",
    models: {
      chatgpt: {
        name: "ChatGPT",
        vendor: "OpenAI",
        blurb: "Structured Markdown, hard rules, format-first output.",
      },
      claude: {
        name: "Claude",
        vendor: "Anthropic",
        blurb: "XML tags, deep reasoning, long-context analysis.",
      },
      gemini: {
        name: "Gemini",
        vendor: "Google",
        blurb: "Hierarchical structure, sources, multimodal-ready.",
      },
    },
    writePromptTitle: "Write your prompt in plain language",
    writePromptSubtitle:
      "Just describe what you want. We will read it, restate it back to you, then format it.",
    promptPlaceholder: "e.g. write me a marketing plan for a new fitness app…",
    confirmIntentTitle: "Did we understand you correctly?",
    confirmIntentSubtitle:
      "Below is what our analyzer thinks you mean. If it is off, edit your prompt and try again.",
    resultTitle: "Your optimized prompt",
    resultSubtitle:
      "Tailored to the rules of your chosen model. Copy it and paste straight into the chat.",
    chooseLangTitle: "Which language should the final prompt be in?",
    chooseLangSubtitle:
      "Pick the language for the optimized prompt content. Structural tokens stay in English.",
    inEnglish: "In English",
    inDetected: "In",
    generate: "Generate",
    next: "Next",
    back: "Back",
    analyze: "Analyze prompt",
    analyzing: "Analyzing…",
    optimizing: "Optimizing…",
    yes: "Yes, generate it",
    no: "No, let me edit",
    copy: "Copy",
    copied: "Copied!",
    startOver: "Start over",
    selectModelFirst: "Please select a model first.",
    promptRequired: "Please write a prompt first.",
    errorGeneric: "Something went wrong. Please try again.",
    targetedFor: "Targeted for",
    rulesAppliedTitle: "Rules applied",
    rulesApplied: {
      chatgpt: [
        "Markdown sections (Role · Context · Task · Constraints · Format · Quality Check)",
        "Hard, numbered constraints",
        "Explicit output schema",
      ],
      claude: [
        "XML tags (<role>, <context>, <task>, <constraints>, <thinking>, <format>)",
        "Step-by-step thinking block",
        "Natural-language clarity",
      ],
      gemini: [
        "Hierarchical: Topic → Domain → Goal",
        "Numbered tasks + bullet instructions",
        "Sources & verification block",
      ],
    },
    footer: "Built with the rules of ChatGPT, Claude & Gemini.",
  },
  ar: {
    appName: "PromptForge",
    tagline: "حوّل الأفكار العادية إلى برومبت مثالي لكل نموذج.",
    description:
      "اختر النموذج المستهدف، اكتب برومبتك الخام، أكّد المعنى، ثم انسخ برومبت محترف لـ ChatGPT أو Claude أو Gemini.",
    steps: {
      pickModel: "اختر النموذج",
      writePrompt: "اكتب البرومبت",
      confirmIntent: "تأكيد القصد",
      result: "البرومبت الجاهز",
    },
    pickModelTitle: "أي نموذج تستهدف؟",
    pickModelSubtitle:
      "كل نموذج له قواعد مختلفة. سنُحسّن البرومبت بناءً على اختيارك.",
    models: {
      chatgpt: {
        name: "ChatGPT",
        vendor: "OpenAI",
        blurb: "Markdown منظم، قواعد صارمة، مخرجات بشكل محدد.",
      },
      claude: {
        name: "Claude",
        vendor: "Anthropic",
        blurb: "وسوم XML، تفكير عميق، تحليل سياق طويل.",
      },
      gemini: {
        name: "Gemini",
        vendor: "Google",
        blurb: "هيكل هرمي، مصادر، جاهز للوسائط المتعددة.",
      },
    },
    writePromptTitle: "اكتب برومبتك بلغة عادية",
    writePromptSubtitle:
      "صف ما تريده فقط. سنقرأه، نُعيد صياغته لك للتأكيد، ثم نحوّله إلى الشكل الصحيح.",
    promptPlaceholder: "مثال: اكتب لي خطة تسويق لتطبيق لياقة بدنية جديد…",
    confirmIntentTitle: "هل فهمناك بشكل صحيح؟",
    confirmIntentSubtitle:
      "هذا ما فهمته الأداة من برومبتك. إن لم يكن دقيقًا، عدّل برومبتك وأعد المحاولة.",
    resultTitle: "برومبتك المُحسَّن",
    resultSubtitle:
      "مُصمَّم بناءً على قواعد النموذج الذي اخترته. انسخه والصقه مباشرة في المحادثة.",
    chooseLangTitle: "بأي لغة تريد كتابة البرومبت النهائي؟",
    chooseLangSubtitle:
      "اختر لغة محتوى البرومبت المُحسَّن. أسماء الوسوم والأقسام تبقى بالإنجليزية.",
    inEnglish: "بالإنجليزية",
    inDetected: "بـ",
    generate: "توليد",
    next: "التالي",
    back: "رجوع",
    analyze: "تحليل البرومبت",
    analyzing: "جارٍ التحليل…",
    optimizing: "جارٍ التحسين…",
    yes: "نعم، قم بالتوليد",
    no: "لا، دعني أعدّل",
    copy: "نسخ",
    copied: "تم النسخ!",
    startOver: "البدء من جديد",
    selectModelFirst: "من فضلك اختر نموذجًا أولًا.",
    promptRequired: "من فضلك اكتب البرومبت أولًا.",
    errorGeneric: "حدث خطأ. حاول مرة أخرى.",
    targetedFor: "مُهيَّأ لـ",
    rulesAppliedTitle: "القواعد المُطبَّقة",
    rulesApplied: {
      chatgpt: [
        "أقسام Markdown (الدور · السياق · المهمة · القواعد · الشكل · التحقق)",
        "قواعد مرقّمة وصارمة",
        "هيكل مخرجات صريح",
      ],
      claude: [
        "وسوم XML (<role>, <context>, <task>, <constraints>, <thinking>, <format>)",
        "كتلة تفكير خطوة بخطوة",
        "وضوح باللغة الطبيعية",
      ],
      gemini: [
        "هيكل هرمي: الموضوع → المجال → الهدف",
        "مهام مرقّمة + تعليمات بنقاط",
        "كتلة مصادر وتحقق",
      ],
    },
    footer: "مبني على قواعد ChatGPT و Claude و Gemini.",
  },
};

export const useTranslate = (lang) => (key) => {
  const path = key.split(".");
  let node = translations[lang];
  for (const p of path) {
    if (node == null) return key;
    node = node[p];
  }
  return node ?? key;
};
