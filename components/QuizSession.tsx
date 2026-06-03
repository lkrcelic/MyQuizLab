"use client";

import { useState, useEffect, useCallback } from "react";
import type { Quiz, Question } from "@/types/quiz";
import { selectSmartPracticeQuestions } from "@/lib/smart-practice";
import { getProgress, recordAnswer } from "@/lib/progress-store";
import { checkAnswer } from "@/lib/scoring";
import { shuffleArray } from "@/lib/shuffle";
import QuizShell from "@/components/QuizShell";
import QuestionCard from "@/components/QuestionCard";
import ExplanationModal from "@/components/ExplanationModal";
import QuizResults from "@/components/QuizResults";

type SessionPhase = "answering" | "explanation" | "results";

interface AnswerRecord {
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizSessionProps {
  quiz: Quiz;
  initialMode: string;
  initialCount: string;
}

export default function QuizSession({ quiz, initialMode, initialCount }: QuizSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [phase, setPhase] = useState<SessionPhase>("answering");
  const [isReady, setIsReady] = useState(false);

  const initSession = useCallback(
    (questionsOverride?: Question[]) => {
      const count = initialCount === "All" ? quiz.questions.length : parseInt(initialCount, 10) || 5;
      const progress = getProgress(quiz.id);

      let selected: Question[];

      if (questionsOverride) {
        selected = questionsOverride;
      } else if (initialMode === "smart") {
        selected = selectSmartPracticeQuestions(quiz.questions, progress, count);
      } else if (initialMode === "mixed") {
        selected = shuffleArray(quiz.questions).slice(0, count);
      } else {
        const filtered = quiz.questions.filter((q) => q.type === initialMode);
        selected =
          filtered.length > 0
            ? shuffleArray(filtered).slice(0, count)
            : selectSmartPracticeQuestions(quiz.questions, progress, count);
      }

      setQuestions(selected);
      setCurrentIndex(0);
      setAnswers({});
      setPhase("answering");
      setIsReady(true);
    },
    [quiz, initialMode, initialCount]
  );

  useEffect(() => {
    initSession();
  }, [initSession]);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = (userAnswer: string) => {
    if (!currentQuestion) return;

    const isCorrect = checkAnswer(currentQuestion, userAnswer);

    recordAnswer(quiz.id, currentQuestion.id, isCorrect);

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { userAnswer, isCorrect },
    }));

    setPhase("explanation");
  };

  const handleContinue = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setPhase("answering");
    } else {
      setPhase("results");
    }
  };

  const handlePracticeMore = () => {
    initSession();
  };

  const handleRetryMissed = () => {
    const missed = questions.filter((q) => answers[q.id] && !answers[q.id].isCorrect);
    if (missed.length > 0) {
      initSession(shuffleArray(missed));
    }
  };

  if (!isReady) {
    return (
      <QuizShell>
        <div className="flex items-center justify-center min-h-[60dvh]">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </QuizShell>
    );
  }

  if (isReady && questions.length === 0) {
    return (
      <QuizShell>
        <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center">
          <div className="text-5xl mb-4">📭</div>
          <h1 className="text-xl font-semibold text-text-primary">No questions found</h1>
          <p className="text-text-secondary mt-2 mb-6">
            There are no questions for this mode. Try Smart Practice instead.
          </p>
          <button
            onClick={() => {
              const progress = getProgress(quiz.id);
              const count = initialCount === "All" ? quiz.questions.length : parseInt(initialCount, 10) || 5;
              const selected = selectSmartPracticeQuestions(quiz.questions, progress, count);
              setQuestions(selected);
              setCurrentIndex(0);
              setAnswers({});
              setPhase("answering");
            }}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-xl transition-all duration-150"
          >
            Start Smart Practice
          </button>
        </div>
      </QuizShell>
    );
  }

  if (phase === "results") {
    return (
      <QuizResults
        quiz={quiz}
        questions={questions}
        answers={answers}
        onPracticeMore={handlePracticeMore}
        onRetryMissed={handleRetryMissed}
      />
    );
  }

  const progressHeader = (
    <div className="flex items-center justify-between max-w-lg mx-auto w-full">
      <span className="text-sm text-text-secondary font-medium">
        {currentIndex + 1} / {questions.length}
      </span>
      <div className="flex-1 mx-4 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>
      <span className="text-xs text-text-muted font-medium px-2 py-0.5 bg-bg-tertiary rounded-md">
        {currentQuestion?.category}
      </span>
    </div>
  );

  return (
    <QuizShell header={progressHeader}>
      {phase === "answering" && currentQuestion && (
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onSubmit={handleAnswer}
        />
      )}

      {phase === "explanation" && currentQuestion && answers[currentQuestion.id] && (
        <ExplanationModal
          question={currentQuestion}
          userAnswer={answers[currentQuestion.id].userAnswer}
          isCorrect={answers[currentQuestion.id].isCorrect}
          isLast={currentIndex === questions.length - 1}
          onContinue={handleContinue}
        />
      )}
    </QuizShell>
  );
}
