"use client";

import { useState } from "react";
import type { Question } from "@/types/quiz";
import type { QuestionStats } from "@/types/progress";
import { getStatusLabel } from "@/lib/smart-practice";

interface ReviewCardProps {
  question: Question;
  stats?: QuestionStats;
}

const STATUS_STYLES: Record<string, string> = {
  Unseen: "bg-bg-tertiary text-text-muted",
  "Needs practice": "bg-error-muted text-error",
  "Recently missed": "bg-error-muted text-error",
  Learning: "bg-accent-muted text-accent",
  Mastered: "bg-success-muted text-success",
};

export default function ReviewCard({ question, stats }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const status = getStatusLabel(stats);

  function resolveCorrectLabel(): string {
    if (question.options) {
      const correct = question.options.find((opt) => opt.id === question.answer);
      if (correct) return correct.label;
    }
    return question.answer;
  }

  return (
    <div
      className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
        expanded ? "bg-bg-secondary border-border" : "bg-bg-secondary border-border"
      }`}
    >
      {/* Collapsed header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">
            {question.prompt}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${STATUS_STYLES[status]}`}>
              {status}
            </span>
            <span className="text-[10px] text-text-muted">{question.category}</span>
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-text-muted flex-shrink-0 mt-1 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="border-t border-border pt-4 space-y-3">
            {/* Correct answer */}
            <div className="flex items-start gap-3 px-3 py-2.5 bg-success-muted rounded-xl">
              <span className="text-[10px] font-semibold text-success uppercase tracking-wider mt-0.5 flex-shrink-0 w-16">
                Answer
              </span>
              <span className="text-sm text-success font-medium">{resolveCorrectLabel()}</span>
            </div>

            {/* Explanation */}
            {question.explanation && (
              <p className="text-sm text-text-secondary leading-relaxed px-1">
                {question.explanation}
              </p>
            )}

            {/* Example */}
            {question.example && (
              <div className="px-3 py-2.5 bg-bg-tertiary rounded-xl">
                <code className="text-xs font-mono text-accent">{question.example}</code>
              </div>
            )}

            {/* Stats */}
            {stats && stats.attempts > 0 && (
              <div className="flex items-center gap-4 px-1 pt-1">
                <span className="text-[11px] text-text-muted">
                  {stats.attempts} attempts
                </span>
                <span className="text-[11px] text-success">
                  {stats.correct} correct
                </span>
                <span className="text-[11px] text-error">
                  {stats.incorrect} wrong
                </span>
                <span className="text-[11px] text-text-muted">
                  {Math.round((stats.correct / stats.attempts) * 100)}% accuracy
                </span>
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 text-[10px] font-medium bg-bg-tertiary text-text-muted rounded-md capitalize">
                {question.difficulty}
              </span>
              {question.tags?.map((tag) => (
                <span key={tag} className="px-2 py-0.5 text-[10px] bg-bg-tertiary text-text-muted rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
