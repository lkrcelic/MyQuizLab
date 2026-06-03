"use client";

import type { Option } from "@/types/quiz";

interface AnswerOptionsProps {
  options: Option[];
  selected: string | null;
  onSelect: (id: string) => void;
}

export default function AnswerOptions({ options, selected, onSelect }: AnswerOptionsProps) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => {
        const isSelected = selected === option.id;

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-150 active:scale-[0.98] ${
              isSelected
                ? "border-accent bg-accent-muted text-text-primary"
                : "border-border bg-bg-secondary text-text-secondary hover:border-text-muted hover:bg-bg-tertiary"
            }`}
          >
            <div className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold uppercase transition-colors ${
                  isSelected
                    ? "bg-accent text-white"
                    : "bg-bg-tertiary text-text-muted"
                }`}
              >
                {option.id}
              </span>
              <span className="text-[15px] leading-snug font-medium pt-0.5">
                {option.label}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
