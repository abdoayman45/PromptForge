import React from "react";
import { Loader2, Sparkles } from "lucide-react";

export const IntentConfirm = ({ loading, interpretation, t }) => {
  return (
    <div
      className="card-flat p-6 md:p-8"
      data-testid="intent-confirm-card"
    >
      <div className="flex items-center gap-2 mb-3 text-zinc-500 text-sm">
        <Sparkles className="h-4 w-4" />
        <span>{t("rulesAppliedTitle")}</span>
      </div>

      {loading ? (
        <div
          className="flex items-center gap-3 text-zinc-600"
          data-testid="intent-loading"
        >
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>{t("analyzing")}</span>
        </div>
      ) : (
        <p
          className="text-lg md:text-xl leading-relaxed text-zinc-900 font-heading"
          data-testid="intent-text"
        >
          {interpretation}
        </p>
      )}
    </div>
  );
};
