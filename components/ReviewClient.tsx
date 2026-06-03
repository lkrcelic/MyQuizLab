"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { Quiz } from "@/types/quiz";
import { getProgress } from "@/lib/progress-store";
import { getStatusLabel } from "@/lib/smart-practice";
import QuizShell from "@/components/QuizShell";
import ReviewCard from "@/components/ReviewCard";

type FilterType = "all" | "unseen" | "needs_practice" | "recently_missed" | "learning" | "mastered" | string;

interface ReviewClientProps {
  quiz: Quiz;
}

export default function ReviewClient({ quiz }: ReviewClientProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const progress = getProgress(quiz.id);

  const statusFilters: { value: FilterType; label: string }[] = [
    { value: "all", label: "All" },
    { value: "unseen", label: "Unseen" },
    { value: "needs_practice", label: "Needs practice" },
    { value: "recently_missed", label: "Recently missed" },
    { value: "learning", label: "Learning" },
    { value: "mastered", label: "Mastered" },
  ];

  const categoryFilters = quiz.categories.map((cat) => ({
    value: `cat:${cat}`,
    label: cat,
  }));

  const filteredQuestions = useMemo(() => {
    return quiz.questions.filter((q) => {
      const stats = progress.questionStats[q.id];
      const status = getStatusLabel(stats);

      if (filter === "all") return true;
      if (filter === "unseen") return status === "Unseen";
      if (filter === "needs_practice") return status === "Needs practice";
      if (filter === "recently_missed") return status === "Recently missed";
      if (filter === "learning") return status === "Learning";
      if (filter === "mastered") return status === "Mastered";
      if (filter.startsWith("cat:")) return q.category === filter.slice(4);

      return true;
    });
  }, [quiz.questions, progress, filter]);

  const header = (
    <div className="flex items-center justify-between max-w-lg mx-auto w-full">
      <Link
        href="/"
        className="text-text-secondary hover:text-text-primary transition-colors text-sm"
      >
        ← Home
      </Link>
      <h1 className="text-sm font-semibold text-text-primary">Review</h1>
      <span className="text-xs text-text-muted">
        {filteredQuestions.length}/{quiz.questions.length}
      </span>
    </div>
  );

  return (
    <QuizShell header={header}>
      {/* Filters — horizontal scroll */}
      <div className="mb-6 -mx-4 px-4">
        {/* Status filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium rounded-full border transition-all duration-150 ${
                filter === value
                  ? "bg-accent-muted border-accent text-accent"
                  : "bg-bg-secondary border-border text-text-secondary hover:border-text-muted"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Category filters */}
        {categoryFilters.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pt-2 pb-1 scrollbar-none">
            {categoryFilters.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(filter === value ? "all" : value)}
                className={`flex-shrink-0 px-3.5 py-2 text-xs font-medium rounded-full border transition-all duration-150 ${
                  filter === value
                    ? "bg-accent-muted border-accent text-accent"
                    : "bg-bg-tertiary border-border text-text-muted hover:border-text-muted"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Questions list */}
      {filteredQuestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-text-secondary text-sm">No questions match this filter.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 pb-8">
          {filteredQuestions.map((question) => (
            <ReviewCard
              key={question.id}
              question={question}
              stats={progress.questionStats[question.id]}
            />
          ))}
        </div>
      )}
    </QuizShell>
  );
}
