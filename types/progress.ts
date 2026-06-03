export type QuestionStats = {
  attempts: number;
  correct: number;
  incorrect: number;
  lastResult: "correct" | "incorrect" | null;
  currentCorrectStreak: number;
  currentIncorrectStreak: number;
  lastAnsweredAt: string | null;
};

export type QuizProgress = {
  questionStats: Record<string, QuestionStats>;
};

export type ProgressStore = {
  quizzes: Record<string, QuizProgress>;
};
