import { describe, it, expect, beforeEach, vi } from "vitest";
import { getProgress, getQuestionStats, recordAnswer } from "@/lib/progress-store";

const mockStorage: Record<string, string> = {};

beforeEach(() => {
  Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);

  vi.stubGlobal("localStorage", {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
  });
});

describe("getProgress", () => {
  it("returns empty progress for unknown quiz", () => {
    const progress = getProgress("unknown-quiz");
    expect(progress.questionStats).toEqual({});
  });
});

describe("recordAnswer", () => {
  it("creates new stats on first correct answer", () => {
    recordAnswer("quiz-1", "q1", true);
    const stats = getQuestionStats("quiz-1", "q1");
    expect(stats).toBeDefined();
    expect(stats!.attempts).toBe(1);
    expect(stats!.correct).toBe(1);
    expect(stats!.incorrect).toBe(0);
    expect(stats!.lastResult).toBe("correct");
    expect(stats!.currentCorrectStreak).toBe(1);
    expect(stats!.currentIncorrectStreak).toBe(0);
    expect(stats!.lastAnsweredAt).toBeTruthy();
  });

  it("creates new stats on first incorrect answer", () => {
    recordAnswer("quiz-1", "q1", false);
    const stats = getQuestionStats("quiz-1", "q1");
    expect(stats!.attempts).toBe(1);
    expect(stats!.correct).toBe(0);
    expect(stats!.incorrect).toBe(1);
    expect(stats!.lastResult).toBe("incorrect");
    expect(stats!.currentCorrectStreak).toBe(0);
    expect(stats!.currentIncorrectStreak).toBe(1);
  });

  it("increments correct streak", () => {
    recordAnswer("quiz-1", "q1", true);
    recordAnswer("quiz-1", "q1", true);
    recordAnswer("quiz-1", "q1", true);
    const stats = getQuestionStats("quiz-1", "q1");
    expect(stats!.attempts).toBe(3);
    expect(stats!.correct).toBe(3);
    expect(stats!.currentCorrectStreak).toBe(3);
    expect(stats!.currentIncorrectStreak).toBe(0);
  });

  it("resets correct streak on incorrect", () => {
    recordAnswer("quiz-1", "q1", true);
    recordAnswer("quiz-1", "q1", true);
    recordAnswer("quiz-1", "q1", false);
    const stats = getQuestionStats("quiz-1", "q1");
    expect(stats!.attempts).toBe(3);
    expect(stats!.correct).toBe(2);
    expect(stats!.incorrect).toBe(1);
    expect(stats!.currentCorrectStreak).toBe(0);
    expect(stats!.currentIncorrectStreak).toBe(1);
    expect(stats!.lastResult).toBe("incorrect");
  });

  it("resets incorrect streak on correct", () => {
    recordAnswer("quiz-1", "q1", false);
    recordAnswer("quiz-1", "q1", false);
    recordAnswer("quiz-1", "q1", true);
    const stats = getQuestionStats("quiz-1", "q1");
    expect(stats!.currentCorrectStreak).toBe(1);
    expect(stats!.currentIncorrectStreak).toBe(0);
  });

  it("tracks multiple questions independently", () => {
    recordAnswer("quiz-1", "q1", true);
    recordAnswer("quiz-1", "q2", false);
    const s1 = getQuestionStats("quiz-1", "q1");
    const s2 = getQuestionStats("quiz-1", "q2");
    expect(s1!.correct).toBe(1);
    expect(s2!.incorrect).toBe(1);
  });

  it("tracks multiple quizzes independently", () => {
    recordAnswer("quiz-a", "q1", true);
    recordAnswer("quiz-b", "q1", false);
    const sa = getQuestionStats("quiz-a", "q1");
    const sb = getQuestionStats("quiz-b", "q1");
    expect(sa!.lastResult).toBe("correct");
    expect(sb!.lastResult).toBe("incorrect");
  });
});

describe("getQuestionStats", () => {
  it("returns undefined for untracked question", () => {
    expect(getQuestionStats("quiz-1", "unknown")).toBeUndefined();
  });
});
