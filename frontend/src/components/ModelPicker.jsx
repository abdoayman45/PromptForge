import React from "react";
import { SiOpenai, SiGoogle, SiAnthropic } from "react-icons/si";

const MODELS = [
  { key: "chatgpt", icon: SiOpenai, accent: "#10A37F" },
  { key: "claude", icon: SiAnthropic, accent: "#D97757" },
  { key: "gemini", icon: SiGoogle, accent: "#4285F4" },
];

export const ModelPicker = ({ selected, onSelect, t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      {MODELS.map((m) => {
        const Icon = m.icon;
        const isSel = selected === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onSelect(m.key)}
            data-testid={`model-select-${m.key}`}
            aria-pressed={isSel}
            className={`card-flat text-start p-5 md:p-6 cursor-pointer ${
              isSel ? "selected" : ""
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ background: `${m.accent}15`, color: m.accent }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-heading text-lg font-semibold text-zinc-900">
                  {t(`models.${m.key}.name`)}
                </div>
                <div className="text-xs text-zinc-500">
                  {t(`models.${m.key}.vendor`)}
                </div>
              </div>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {t(`models.${m.key}.blurb`)}
            </p>
          </button>
        );
      })}
    </div>
  );
};
