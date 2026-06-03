"use client";

import { useState } from "react";
import Link from "next/link";
import QuizShell from "@/components/QuizShell";

type QuizInfo = { id: string; title: string; description: string };
type Mode = "smart" | "mixed" | "what_does_it_do" | "pick_correct" | "detail_meaning" | "type_answer";

const MODES: { value: Mode; label: string }[] = [
  { value: "smart", label: "Smart Practice" },
  { value: "mixed", label: "Mixed" },
  { value: "what_does_it_do", label: "What does it do?" },
  { value: "pick_correct", label: "Pick the correct" },
  { value: "detail_meaning", label: "Detail meaning" },
  { value: "type_answer", label: "Type the answer" },
];

const COUNTS = [5, 10, 20, "All"] as const;

interface HomeClientProps {
  quizzes: QuizInfo[];
  defaultQuiz: QuizInfo | null;
}

export default function HomeClient({ quizzes, defaultQuiz }: HomeClientProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [mode, setMode] = useState<Mode>("smart");
  const [count, setCount] = useState<number | "All">(5);

  const quiz = defaultQuiz || quizzes[0];

  if (!quiz) {
    return (
      <QuizShell>
        <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center">
          <div className="text-5xl mb-4">📭</div>
          <h1 className="text-xl font-semibold text-text-primary">No quizzes found</h1>
          <p className="text-text-secondary mt-2">Add a quiz JSON file to get started.</p>
        </div>
      </QuizShell>
    );
  }

  const quizUrl = (m: Mode, c: number | "All") => {
    const params = new URLSearchParams();
    if (m !== "smart") params.set("mode", m);
    if (c !== 5) params.set("count", String(c));
    const qs = params.toString();
    return `/quiz/${quiz.id}${qs ? `?${qs}` : ""}`;
  };

  return (
    <QuizShell>
      <div className="flex flex-col min-h-[85dvh]">
        {/* Hero */}
        <div className="flex-1 flex flex-col justify-center py-8">
          <div className="mb-2">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-accent-muted text-accent rounded-full">
              Quick session
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-text-primary">
            MyQuizLab
          </h1>

          <p className="mt-3 text-text-secondary leading-relaxed">
            {quiz.description}
          </p>

          {/* Primary CTA */}
          <Link
            href={quizUrl("smart", 5)}
            className="mt-8 flex items-center justify-center gap-2 w-full py-4 px-6 bg-accent hover:bg-accent-hover active:scale-[0.98] text-white font-semibold text-lg rounded-2xl transition-all duration-150 shadow-lg shadow-accent/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start Smart Practice
          </Link>

          {/* Secondary links */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowCustom(!showCustom)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {showCustom ? "Hide options" : "Custom session →"}
            </button>

            <Link
              href={`/review/${quiz.id}`}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Review all →
            </Link>
          </div>

          {/* Custom session panel */}
          {showCustom && (
            <div className="mt-5 p-5 bg-bg-secondary rounded-2xl border border-border animate-fade-in">
              {/* Mode selector */}
              <div className="mb-5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 block">
                  Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {MODES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setMode(value)}
                      className={`px-3 py-2.5 text-sm rounded-xl border transition-all duration-150 ${
                        mode === value
                          ? "bg-accent-muted border-accent text-accent font-medium"
                          : "bg-bg-tertiary border-border text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Count selector */}
              <div className="mb-5">
                <label className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3 block">
                  Questions
                </label>
                <div className="flex gap-2">
                  {COUNTS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCount(c)}
                      className={`flex-1 py-2.5 text-sm rounded-xl border transition-all duration-150 ${
                        count === c
                          ? "bg-accent-muted border-accent text-accent font-medium"
                          : "bg-bg-tertiary border-border text-text-secondary hover:border-text-muted"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Start custom */}
              <Link
                href={quizUrl(mode, count)}
                className="flex items-center justify-center w-full py-3.5 px-6 bg-bg-tertiary hover:bg-bg-elevated active:scale-[0.98] text-text-primary font-medium rounded-xl border border-border transition-all duration-150"
              >
                Start session
              </Link>
            </div>
          )}
        </div>
      </div>
    </QuizShell>
  );
}
