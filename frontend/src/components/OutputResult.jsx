import React, { useState } from "react";
import { Copy, Check, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";

export const OutputResult = ({ loading, optimized, model, t }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!optimized) return;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(optimized);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      // Fallback for restricted iframe / headless contexts
      try {
        const ta = document.createElement("textarea");
        ta.value = optimized;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 1800);
    } else {
      toast.error(t("errorGeneric"));
    }
  };

  return (
    <div className="space-y-4" data-testid="output-result-section">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm text-zinc-500">
          {t("targetedFor")}:{" "}
          <span className="font-medium text-zinc-900">
            {t(`models.${model}.name`)}
          </span>
        </div>
        <Button
          onClick={handleCopy}
          disabled={loading || !optimized}
          data-testid="copy-prompt-btn"
          className="bg-black text-white hover:bg-zinc-800 active:scale-[0.98] gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> {t("copied")}
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> {t("copy")}
            </>
          )}
        </Button>
      </div>

      <div className="code-shell" data-testid="code-block">
        {loading ? (
          <div className="p-6 flex items-center gap-3 text-slate-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t("optimizing")}</span>
          </div>
        ) : (
          <pre data-testid="optimized-pre">{optimized}</pre>
        )}
      </div>
    </div>
  );
};
