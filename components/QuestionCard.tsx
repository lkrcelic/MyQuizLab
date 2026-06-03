"use client";

import { useState } from "react";
import type { Question } from "@/types/quiz";
import AnswerOptions from "@/components/AnswerOptions";
import TypeAnswerInput from "@/components/TypeAnswerInput";

interface QuestionCardProps {
  question: Question;
  onSubmit: (answer: string) => void;
}

export default function QuestionCard({ question, onSubmit }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");

  const isTyped = question.type === "type_answer";
  const canSubmit = isTyped ? typedAnswer.trim().length > 0 : selected !== null;

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (isTyped) {
      onSubmit(typedAnswer);
    } else {
      onSubmit(selected!);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    setSelected(optionId);
    onSubmit(optionId);
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-80px)] animate-fade-in">
      {/* Question prompt */}
      <div className="pt-2 pb-6">
        <p className="text-xl font-semibold leading-relaxed text-text-primary">
          {question.prompt}
        </p>
        {question.example && question.type !== "type_answer" && (
          <div className="mt-3 px-4 py-3 bg-bg-secondary rounded-xl border border-border">
            <code className="text-sm font-mono text-accent">{question.example}</code>
          </div>
        )}
      </div>

      {/* Answer area */}
      <div className="flex-1">
        {isTyped ? (
          <TypeAnswerInput
            value={typedAnswer}
            onChange={setTypedAnswer}
            onSubmit={handleSubmit}
            example={question.example}
          />
        ) : (
          <AnswerOptions
            options={question.options || []}
            selected={selected}
            onSelect={handleOptionSelect}
          />
        )}
      </div>

      {/* Submit button — only for type_answer questions */}
      {isTyped && (
        <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 px-6 font-semibold text-base rounded-2xl transition-all duration-150 ${
              canSubmit
                ? "bg-accent hover:bg-accent-hover active:scale-[0.98] text-white shadow-lg shadow-accent/20"
                : "bg-bg-tertiary text-text-muted cursor-not-allowed"
            }`}
          >
            Check Answer
          </button>
        </div>
      )}
    </div>
  );
}
