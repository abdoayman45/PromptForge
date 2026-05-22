import React from "react";
import { Textarea } from "./ui/textarea";

export const PromptInput = ({ value, onChange, t }) => {
  return (
    <div>
      <Textarea
        data-testid="prompt-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("promptPlaceholder")}
        className="min-h-[200px] md:min-h-[260px] text-base resize-y border-zinc-200 focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      />
      <div className="mt-2 text-xs text-zinc-500 flex justify-between">
        <span>{value.length} chars</span>
        <span>{value.trim().split(/\s+/).filter(Boolean).length} words</span>
      </div>
    </div>
  );
};
