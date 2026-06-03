import type {
  QuestionStats,
  QuizProgress,
  ProgressStore,
} from "@/types/progress";

const STORAGE_KEY = "myquizlab_progress";

export function isLocalStorageAvailable(): boolean {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function getProgressStore(): ProgressStore {
  if (!isLocalStorageAvailable()) {
    return { quizzes: {} };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { quizzes: {} };
    }
    return JSON.parse(data) as ProgressStore;
  } catch (error) {
    console.warn("Failed to parse progress data:", error);
    return { quizzes: {} };
  }
}

function saveProgressStore(store: ProgressStore): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to save progress:", error);
  }
}

export function getProgress(quizId: string): QuizProgress {
  const store = getProgressStore();
  return store.quizzes[quizId] || { questionStats: {} };
}

export function getQuestionStats(
  quizId: string,
  questionId: string
): QuestionStats | undefined {
  const progress = getProgress(quizId);
  return progress.questionStats[questionId];
}

export function recordAnswer(
  quizId: string,
  questionId: string,
  isCorrect: boolean
): void {
  const store = getProgressStore();

  if (!store.quizzes[quizId]) {
    store.quizzes[quizId] = { questionStats: {} };
  }

  const currentStats = store.quizzes[quizId].questionStats[questionId];

  const newStats: QuestionStats = currentStats
    ? {
        attempts: currentStats.attempts + 1,
        correct: isCorrect
          ? currentStats.correct + 1
          : currentStats.correct,
        incorrect: isCorrect
          ? currentStats.incorrect
          : currentStats.incorrect + 1,
        lastResult: isCorrect ? "correct" : "incorrect",
        currentCorrectStreak: isCorrect
          ? currentStats.currentCorrectStreak + 1
          : 0,
        currentIncorrectStreak: isCorrect
          ? 0
          : currentStats.currentIncorrectStreak + 1,
        lastAnsweredAt: new Date().toISOString(),
      }
    : {
        attempts: 1,
        correct: isCorrect ? 1 : 0,
        incorrect: isCorrect ? 0 : 1,
        lastResult: isCorrect ? "correct" : "incorrect",
        currentCorrectStreak: isCorrect ? 1 : 0,
        currentIncorrectStreak: isCorrect ? 0 : 1,
        lastAnsweredAt: new Date().toISOString(),
      };

  store.quizzes[quizId].questionStats[questionId] = newStats;
  saveProgressStore(store);
}
