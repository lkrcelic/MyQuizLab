"use client";

import Link from "next/link";
import type { Quiz, Question } from "@/types/quiz";
import QuizShell from "@/components/QuizShell";

interface AnswerRecord {
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizResultsProps {
  quiz: Quiz;
  questions: Question[];
  answers: Record<string, AnswerRecord>;
  onPracticeMore: () => void;
  onRetryMissed: () => void;
}

export default function QuizResults({
  quiz,
  questions,
  answers,
  onPracticeMore,
  onRetryMissed,
}: QuizResultsProps) {
  const total = questions.length;
  const correct = Object.values(answers).filter((a) => a.isCorrect).length;
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
  const hasMissed = incorrect > 0;

  const circumference = 2 * Math.PI * 52;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <QuizShell>
      <div className="flex flex-col items-center min-h-[85dvh] py-8 animate-fade-in">
        {/* Score ring */}
        <div className="relative w-36 h-36 mb-8">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-bg-tertiary"
            />
            <circle
              cx="60"
              cy="60"
              r="52"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className={percentage >= 80 ? "text-success" : percentage >= 50 ? "text-accent" : "text-error"}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.8s ease-out",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-text-primary">{percentage}%</span>
          </div>
        </div>

        {/* Score message */}
        <h2 className="text-xl font-bold text-text-primary mb-2">
          {percentage === 100
            ? "Perfect!"
            : percentage >= 80
              ? "Great job!"
              : percentage >= 50
                ? "Good effort!"
                : "Keep practicing!"}
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          {correct} correct · {incorrect} incorrect out of {total}
        </p>

        {/* Stats cards */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          <div className="flex flex-col items-center p-4 bg-success-muted rounded-2xl">
            <span className="text-2xl font-bold text-success">{correct}</span>
            <span className="text-xs text-success/80 font-medium mt-1">Correct</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-error-muted rounded-2xl">
            <span className="text-2xl font-bold text-error">{incorrect}</span>
            <span className="text-xs text-error/80 font-medium mt-1">Incorrect</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-3 mt-auto">
          <button
            onClick={onPracticeMore}
            className="w-full py-4 px-6 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white font-semibold text-base rounded-2xl transition-all duration-150 shadow-lg shadow-accent/20"
          >
            Practice 5 more
          </button>

          {hasMissed && (
            <button
              onClick={onRetryMissed}
              className="w-full py-3.5 px-6 bg-bg-secondary hover:bg-bg-tertiary border border-border text-text-primary font-medium rounded-xl transition-all duration-150"
            >
              Retry {incorrect} missed
            </button>
          )}

          <Link
            href={`/review/${quiz.id}`}
            className="w-full py-3.5 px-6 text-center text-text-secondary hover:text-text-primary text-sm transition-colors"
          >
            Review all questions →
          </Link>
        </div>
      </div>
    </QuizShell>
  );
}
