import React from "react";
import { Check } from "lucide-react";
import { translations } from "../i18n";

export const RulesList = ({ model, lang, t }) => {
  const items = translations[lang]?.rulesApplied?.[model] || [];
  return (
    <div className="card-flat p-5 md:p-6" data-testid="rules-applied-card">
      <div className="text-sm font-medium text-zinc-500 mb-3">
        {t("rulesAppliedTitle")} — {t(`models.${model}.name`)}
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-zinc-700"
          >
            <Check className="h-4 w-4 mt-0.5 text-emerald-600 flex-shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
