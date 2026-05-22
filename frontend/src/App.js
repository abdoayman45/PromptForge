import { useEffect, useState } from "react";
import "@/App.css";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Languages, ArrowRight, ArrowLeft, RefreshCw, Zap } from "lucide-react";

import { translations, useTranslate } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Toaster, toast } from "sonner";

import { Stepper } from "@/components/Stepper";
import { ModelPicker } from "@/components/ModelPicker";
import { PromptInput } from "@/components/PromptInput";
import { IntentConfirm } from "@/components/IntentConfirm";
import { OutputResult } from "@/components/OutputResult";
import { RulesList } from "@/components/RulesList";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const STEPS = [
  { key: "pickModel" },
  { key: "writePrompt" },
  { key: "confirmIntent" },
  { key: "result" },
];

function App() {
  const [lang, setLang] = useState("en");
  const t = useTranslate(lang);

  const [step, setStep] = useState(1);
  const [model, setModel] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [interpretation, setInterpretation] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState("English");
  const [detectedLanguageCode, setDetectedLanguageCode] = useState("en");
  const [optimized, setOptimized] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizing, setOptimizing] = useState(false);
  const [showLangChoice, setShowLangChoice] = useState(false);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const toggleLang = () => setLang((l) => (l === "en" ? "ar" : "en"));

  const goNext = async () => {
    if (step === 1) {
      if (!model) {
        toast.error(t("selectModelFirst"));
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!prompt.trim()) {
        toast.error(t("promptRequired"));
        return;
      }
      // Move to step 3 and trigger analyze
      setStep(3);
      setInterpretation("");
      setAnalyzing(true);
      try {
        const res = await axios.post(`${API}/analyze`, {
          model,
          prompt: prompt.trim(),
        });
        setInterpretation(res.data.interpretation || "");
        setDetectedLanguage(res.data.detected_language || "English");
        setDetectedLanguageCode(res.data.detected_language_code || "en");
      } catch (e) {
        console.error(e);
        toast.error(t("errorGeneric"));
        setStep(2);
      } finally {
        setAnalyzing(false);
      }
      return;
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const confirmYes = () => {
    // Open language choice dialog before optimizing
    setShowLangChoice(true);
  };

  const runOptimize = async (outputLanguage) => {
    setShowLangChoice(false);
    setStep(4);
    setOptimized("");
    setOptimizing(true);
    try {
      const res = await axios.post(`${API}/optimize`, {
        model,
        prompt: prompt.trim(),
        output_language: outputLanguage,
      });
      setOptimized(res.data.optimized_prompt || "");
    } catch (e) {
      console.error(e);
      toast.error(t("errorGeneric"));
      setStep(3);
    } finally {
      setOptimizing(false);
    }
  };

  const confirmNo = () => {
    setStep(2);
  };

  const startOver = () => {
    setStep(1);
    setModel(null);
    setPrompt("");
    setInterpretation("");
    setDetectedLanguage("English");
    setDetectedLanguageCode("en");
    setOptimized("");
    setShowLangChoice(false);
  };

  return (
    <div className="App min-h-screen bg-white text-zinc-900 relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-grid opacity-60 pointer-events-none" />

      <Toaster richColors position={lang === "ar" ? "top-left" : "top-right"} />

      {/* Navbar */}
      <header className="relative border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading font-semibold text-lg tracking-tight">
              {t("appName")}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            data-testid="lang-toggle-btn"
            aria-label="Toggle language"
            className="gap-2 border-zinc-200 hover:bg-zinc-50"
          >
            <Languages className="h-4 w-4" />
            <span className="font-medium">
              {lang === "en" ? "العربية" : "English"}
            </span>
          </Button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-16">
        {/* Hero */}
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 text-xs text-zinc-600 mb-5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {translations[lang].tagline}
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-zinc-900 mb-4 leading-[1.05]">
            {t("appName")}
          </h1>
          <p className="text-base md:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Stepper */}
        <div className="mb-8 md:mb-10">
          <Stepper steps={STEPS} current={step} t={t} />
        </div>

        {/* Step content */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                data-testid="step-1"
              >
                <div className="mb-6">
                  <h2 className="font-heading text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">
                    {t("pickModelTitle")}
                  </h2>
                  <p className="text-zinc-600">{t("pickModelSubtitle")}</p>
                </div>
                <ModelPicker selected={model} onSelect={setModel} t={t} />
                <NavRow
                  lang={lang}
                  showBack={false}
                  nextLabel={t("next")}
                  onNext={goNext}
                  nextTestId="step1-next-btn"
                  nextDisabled={!model}
                />
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                data-testid="step-2"
              >
                <div className="mb-6">
                  <h2 className="font-heading text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">
                    {t("writePromptTitle")}
                  </h2>
                  <p className="text-zinc-600">{t("writePromptSubtitle")}</p>
                </div>
                <PromptInput value={prompt} onChange={setPrompt} t={t} />
                <NavRow
                  lang={lang}
                  showBack
                  onBack={goBack}
                  backLabel={t("back")}
                  nextLabel={t("analyze")}
                  onNext={goNext}
                  nextTestId="step2-analyze-btn"
                  nextDisabled={!prompt.trim()}
                />
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                data-testid="step-3"
              >
                <div className="mb-6">
                  <h2 className="font-heading text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">
                    {t("confirmIntentTitle")}
                  </h2>
                  <p className="text-zinc-600">{t("confirmIntentSubtitle")}</p>
                </div>

                <IntentConfirm
                  loading={analyzing}
                  interpretation={interpretation}
                  t={t}
                />

                <div className="mt-6 flex flex-wrap items-center gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={confirmNo}
                    disabled={analyzing}
                    data-testid="confirm-no-btn"
                    className="border-zinc-200 hover:bg-zinc-50"
                  >
                    {t("no")}
                  </Button>
                  <Button
                    onClick={confirmYes}
                    disabled={analyzing || !interpretation}
                    data-testid="confirm-yes-btn"
                    className="bg-black text-white hover:bg-zinc-800 active:scale-[0.98] gap-2"
                  >
                    {t("yes")}
                    <ArrowRight
                      className={`h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`}
                    />
                  </Button>
                </div>
              </motion.section>
            )}

            {step === 4 && (
              <motion.section
                key="step4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                data-testid="step-4"
              >
                <div className="mb-6 flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <h2 className="font-heading text-2xl md:text-3xl font-semibold text-zinc-900 mb-2">
                      {t("resultTitle")}
                    </h2>
                    <p className="text-zinc-600">{t("resultSubtitle")}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={startOver}
                    data-testid="start-over-btn"
                    className="gap-2 border-zinc-200 hover:bg-zinc-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    {t("startOver")}
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                  <div className="md:col-span-2">
                    <OutputResult
                      loading={optimizing}
                      optimized={optimized}
                      model={model}
                      t={t}
                    />
                  </div>
                  <div>
                    <RulesList model={model} lang={lang} t={t} />
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Language choice dialog */}
      <Dialog open={showLangChoice} onOpenChange={setShowLangChoice}>
        <DialogContent
          className="sm:max-w-md"
          data-testid="lang-choice-dialog"
          dir={lang === "ar" ? "rtl" : "ltr"}
        >
          <DialogHeader>
            <DialogTitle className="font-heading text-xl text-start">
              {t("chooseLangTitle")}
            </DialogTitle>
            <DialogDescription className="text-start">
              {t("chooseLangSubtitle")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            <Button
              onClick={() => runOptimize("English")}
              data-testid="lang-choice-english"
              variant="outline"
              className="h-auto py-4 flex-col items-start gap-1 border-zinc-200 hover:border-black hover:bg-zinc-50 text-start"
            >
              <span className="text-base font-semibold">English</span>
              <span className="text-xs text-zinc-500 font-normal">
                {t("inEnglish")}
              </span>
            </Button>
            <Button
              onClick={() => runOptimize(detectedLanguage)}
              data-testid="lang-choice-detected"
              className="h-auto py-4 flex-col items-start gap-1 bg-black text-white hover:bg-zinc-800 text-start"
            >
              <span className="text-base font-semibold">
                {detectedLanguage}
              </span>
              <span className="text-xs opacity-80 font-normal">
                {t("inDetected")} {detectedLanguage}
              </span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="relative border-t border-zinc-100 mt-10">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 text-xs text-zinc-500 text-center">
          {t("footer")}
        </div>
      </footer>
    </div>
  );
}

const NavRow = ({
  lang,
  showBack,
  onBack,
  backLabel,
  onNext,
  nextLabel,
  nextDisabled,
  nextTestId,
}) => {
  const ArrowIcon = lang === "ar" ? ArrowLeft : ArrowRight;
  return (
    <div className="mt-8 flex items-center justify-between">
      <div>
        {showBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            data-testid="nav-back-btn"
            className="text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
          >
            {backLabel}
          </Button>
        )}
      </div>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        data-testid={nextTestId}
        className="bg-black text-white hover:bg-zinc-800 active:scale-[0.98] gap-2 disabled:opacity-40"
      >
        {nextLabel}
        <ArrowIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default App;
