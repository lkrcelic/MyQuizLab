import { describe, it, expect } from "vitest";
import {
  isMastered,
  getStatusLabel,
  selectSmartPracticeQuestions,
} from "@/lib/smart-practice";
import type { Question } from "@/types/quiz";
import type { QuestionStats, QuizProgress } from "@/types/progress";

function makeQuestion(id: string): Question {
  return {
    id,
    type: "pick_correct",
    category: "Test",
    difficulty: "beginner",
    prompt: `Question ${id}`,
    options: [
      { id: "a", label: "A", isCorrect: true },
      { id: "b", label: "B", isCorrect: false },
    ],
    answer: "a",
    explanation: "Explanation",
  };
}

function makeStats(overrides: Partial<QuestionStats> = {}): QuestionStats {
  return {
    attempts: 0,
    correct: 0,
    incorrect: 0,
    lastResult: null,
    currentCorrectStreak: 0,
    currentIncorrectStreak: 0,
    lastAnsweredAt: null,
    ...overrides,
  };
}

describe("isMastered", () => {
  it("returns false for no stats", () => {
    expect(isMastered(makeStats())).toBe(false);
  });

  it("returns false with insufficient correct answers", () => {
    expect(isMastered(makeStats({ attempts: 3, correct: 2, currentCorrectStreak: 3 }))).toBe(false);
  });

  it("returns false with low streak", () => {
    expect(isMastered(makeStats({ attempts: 5, correct: 4, currentCorrectStreak: 2 }))).toBe(false);
  });

  it("returns false with low accuracy", () => {
    expect(
      isMastered(makeStats({ attempts: 10, correct: 3, incorrect: 7, currentCorrectStreak: 3 }))
    ).toBe(false);
  });

  it("returns true when all criteria met", () => {
    expect(
      isMastered(makeStats({ attempts: 4, correct: 4, incorrect: 0, currentCorrectStreak: 4 }))
    ).toBe(true);
  });

  it("returns true at boundary: 3 correct, 3 streak, 80% accuracy", () => {
    expect(
      isMastered(
        makeStats({ attempts: 3, correct: 3, incorrect: 0, currentCorrectStreak: 3 })
      )
    ).toBe(true);
  });
});

describe("getStatusLabel", () => {
  it("returns Unseen for no stats", () => {
    expect(getStatusLabel(undefined)).toBe("Unseen");
  });

  it("returns Unseen for zero attempts", () => {
    expect(getStatusLabel(makeStats())).toBe("Unseen");
  });

  it("returns Recently missed when last was incorrect", () => {
    expect(
      getStatusLabel(makeStats({ attempts: 3, correct: 1, incorrect: 2, lastResult: "incorrect" }))
    ).toBe("Recently missed");
  });

  it("returns Needs practice for low accuracy with correct last", () => {
    expect(
      getStatusLabel(
        makeStats({
          attempts: 5,
          correct: 2,
          incorrect: 3,
          lastResult: "correct",
          currentCorrectStreak: 1,
        })
      )
    ).toBe("Needs practice");
  });

  it("returns Learning for decent accuracy", () => {
    expect(
      getStatusLabel(
        makeStats({
          attempts: 5,
          correct: 4,
          incorrect: 1,
          lastResult: "correct",
          currentCorrectStreak: 2,
        })
      )
    ).toBe("Learning");
  });

  it("returns Mastered when fully mastered", () => {
    expect(
      getStatusLabel(
        makeStats({
          attempts: 4,
          correct: 4,
          incorrect: 0,
          lastResult: "correct",
          currentCorrectStreak: 4,
        })
      )
    ).toBe("Mastered");
  });
});

describe("selectSmartPracticeQuestions", () => {
  it("returns the requested count", () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`));
    const progress: QuizProgress = { questionStats: {} };
    const result = selectSmartPracticeQuestions(questions, progress, 5);
    expect(result).toHaveLength(5);
  });

  it("returns all if count exceeds available", () => {
    const questions = [makeQuestion("q1"), makeQuestion("q2")];
    const progress: QuizProgress = { questionStats: {} };
    const result = selectSmartPracticeQuestions(questions, progress, 5);
    expect(result).toHaveLength(2);
  });

  it("prioritizes unseen questions", () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`));
    const progress: QuizProgress = {
      questionStats: {
        q0: makeStats({ attempts: 5, correct: 5, currentCorrectStreak: 5 }),
        q1: makeStats({ attempts: 5, correct: 5, currentCorrectStreak: 5 }),
      },
    };
    const result = selectSmartPracticeQuestions(questions, progress, 5);
    const unseenIds = result
      .map((q) => q.id)
      .filter((id) => !progress.questionStats[id]);
    expect(unseenIds.length).toBeGreaterThanOrEqual(2);
  });

  it("includes weak questions", () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`));
    const progress: QuizProgress = {
      questionStats: {
        q0: makeStats({ attempts: 3, correct: 0, incorrect: 3, lastResult: "incorrect", currentIncorrectStreak: 3 }),
        q1: makeStats({ attempts: 3, correct: 1, incorrect: 2, lastResult: "incorrect", currentIncorrectStreak: 1 }),
      },
    };
    const result = selectSmartPracticeQuestions(questions, progress, 5);
    const hasWeak = result.some((q) => q.id === "q0" || q.id === "q1");
    expect(hasWeak).toBe(true);
  });

  it("returns unique questions", () => {
    const questions = Array.from({ length: 10 }, (_, i) => makeQuestion(`q${i}`));
    const progress: QuizProgress = { questionStats: {} };
    const result = selectSmartPracticeQuestions(questions, progress, 5);
    const ids = result.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
