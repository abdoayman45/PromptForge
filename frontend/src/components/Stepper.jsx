import React from "react";
import { Check } from "lucide-react";

export const Stepper = ({ steps, current, t }) => {
  return (
    <div
      className="flex items-center justify-center gap-2 md:gap-4 flex-wrap"
      data-testid="stepper"
    >
      {steps.map((s, i) => {
        const idx = i + 1;
        const done = idx < current;
        const active = idx === current;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <div
                className={[
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-medium border transition-all",
                  done
                    ? "bg-black text-white border-black"
                    : active
                      ? "bg-black text-white border-black"
                      : "bg-white text-zinc-400 border-zinc-200",
                ].join(" ")}
                data-testid={`step-circle-${s.key}`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : idx}
              </div>
              <span
                className={[
                  "text-sm font-medium",
                  active
                    ? "text-zinc-900"
                    : done
                      ? "text-zinc-700"
                      : "text-zinc-400",
                ].join(" ")}
              >
                {t(`steps.${s.key}`)}
              </span>
            </div>
            {idx < steps.length && (
              <div className="hidden md:block h-px w-10 bg-zinc-200" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
