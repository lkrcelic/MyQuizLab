"use client";

import { useState } from "react";
import type { Question, Rating } from "@/types/quiz";
import { buildChatGPTUrl } from "@/lib/chatgpt-prompt";
import { setRating } from "@/lib/ratings-client";

interface ExplanationModalProps {
  question: Question;
  userAnswer: string;
  isCorrect: boolean;
  isLast: boolean;
  onContinue: () => void;
}

function resolveAnswerLabel(question: Question, answerId: string): string {
  if (question.options) {
    const option = question.options.find((opt) => opt.id === answerId);
    if (option) return option.label;
  }
  return answerId;
}

function getCorrectExplanation(question: Question): string | undefined {
  if (question.options) {
    const correct = question.options.find((opt) => opt.id === question.answer);
    if (correct?.explanation) return correct.explanation;
  }
  return question.explanation;
}

export default function ExplanationModal({
  question,
  userAnswer,
  isCorrect,
  isLast,
  onContinue,
}: ExplanationModalProps) {
  const correctLabel = resolveAnswerLabel(question, question.answer);
  const userLabel = resolveAnswerLabel(question, userAnswer);
  const explanation = getCorrectExplanation(question);
  const chatGPTUrl = buildChatGPTUrl(question);

  const [rating, setLocalRating] = useState<Rating>(question.rating ?? null);
  const [saving, setSaving] = useState(false);

  const applyRating = async (next: Rating) => {
    const previous = rating;
    setLocalRating(next);
    setSaving(true);
    try {
      await setRating(question.id, next);
    } catch {
      setLocalRating(previous);
    } finally {
      setSaving(false);
    }
  };

  const handleGreat = () => applyRating(rating === "great" ? null : "great");

  const handleDelete = () => {
    if (rating === "deleted") {
      applyRating(null);
      return;
    }
    if (window.confirm("Hide this question from future quizzes?")) {
      applyRating("deleted");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg-primary animate-fade-in">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Result badge */}
          <div className="mb-6">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                isCorrect
                  ? "bg-success-muted text-success"
                  : "bg-error-muted text-error"
              }`}
            >
              {isCorrect ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              {isCorrect ? "Correct!" : "Incorrect"}
            </div>
          </div>

          {/* Question recap */}
          <p className="text-lg font-semibold text-text-primary leading-relaxed mb-6">
            {question.prompt}
          </p>

          {/* Answers comparison */}
          <div className="flex flex-col gap-3 mb-6">
            {!isCorrect && (
              <div className="flex items-start gap-3 px-4 py-3.5 bg-error-muted rounded-xl">
                <span className="text-xs font-medium text-error uppercase tracking-wider mt-0.5 flex-shrink-0 w-20">
                  Yours
                </span>
                <span className="text-sm text-error font-medium">{userLabel}</span>
              </div>
            )}
            <div className="flex items-start gap-3 px-4 py-3.5 bg-success-muted rounded-xl">
              <span className="text-xs font-medium text-success uppercase tracking-wider mt-0.5 flex-shrink-0 w-20">
                Correct
              </span>
              <span className="text-sm text-success font-medium">{correctLabel}</span>
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="mb-6 p-5 bg-bg-secondary rounded-2xl border border-border">
              <p className="text-[15px] text-text-secondary leading-relaxed">
                {explanation}
              </p>
            </div>
          )}

          {/* Example */}
          {question.example && (
            <div className="mb-6 px-5 py-4 bg-bg-tertiary rounded-2xl border border-border">
              <span className="text-xs text-text-muted uppercase tracking-wider block mb-2">
                Example
              </span>
              <code className="text-sm font-mono text-accent leading-relaxed">
                {question.example}
              </code>
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2.5 py-1 text-xs font-medium bg-bg-tertiary text-text-muted rounded-lg">
              {question.category}
            </span>
            <span className="px-2.5 py-1 text-xs font-medium bg-bg-tertiary text-text-muted rounded-lg capitalize">
              {question.difficulty}
            </span>
          </div>

          {/* ChatGPT link */}
          <a
            href={chatGPTUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 px-5 bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-secondary hover:text-text-primary rounded-xl transition-all duration-150"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Ask more on ChatGPT
          </a>

          {/* Rate this question */}
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleGreat}
              disabled={saving}
              aria-pressed={rating === "great"}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-150 disabled:opacity-50 ${
                rating === "great"
                  ? "bg-success-muted border-success text-success"
                  : "bg-bg-secondary hover:bg-bg-tertiary border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>👍</span>
              Great question
            </button>
            <button
              onClick={handleDelete}
              disabled={saving}
              aria-pressed={rating === "deleted"}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-150 disabled:opacity-50 ${
                rating === "deleted"
                  ? "bg-error-muted border-error text-error"
                  : "bg-bg-secondary hover:bg-bg-tertiary border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <span>🗑</span>
              {rating === "deleted" ? "Hidden" : "Delete question"}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky continue button */}
      <div className="sticky bottom-0 bg-gradient-to-t from-bg-primary via-bg-primary/95 to-transparent px-4 pb-6 pt-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onContinue}
            className="w-full py-4 px-6 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white font-semibold text-base rounded-2xl transition-all duration-150 shadow-lg shadow-accent/20"
          >
            {isLast ? "See Results" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
