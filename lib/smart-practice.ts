import type { Question } from "@/types/quiz";
import type { QuizProgress, QuestionStats } from "@/types/progress";

function getPriorityScore(stats?: QuestionStats): number {
  if (!stats) return 100;

  const accuracy =
    stats.attempts === 0 ? 0 : stats.correct / stats.attempts;

  let score = 0;

  if (stats.attempts === 0) score += 100;
  if (stats.lastResult === "incorrect") score += 80;
  if (accuracy < 0.5) score += 50;
  if (stats.attempts < 3) score += 30;
  if (stats.currentIncorrectStreak > 1) score += 30;

  return score;
}

export function isMastered(stats: QuestionStats): boolean {
  if (!stats || stats.attempts === 0) return false;

  const accuracy = stats.correct / stats.attempts;

  return (
    stats.correct >= 3 &&
    stats.currentCorrectStreak >= 3 &&
    accuracy >= 0.8
  );
}

export function getStatusLabel(
  stats?: QuestionStats
): "Unseen" | "Needs practice" | "Recently missed" | "Learning" | "Mastered" {
  if (!stats || stats.attempts === 0) return "Unseen";

  if (isMastered(stats)) return "Mastered";

  if (stats.lastResult === "incorrect") return "Recently missed";

  const accuracy = stats.correct / stats.attempts;

  if (accuracy < 0.6) return "Needs practice";

  return "Learning";
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function selectSmartPracticeQuestions(
  questions: Question[],
  progress: QuizProgress,
  count: number
): Question[] {
  const questionsWithScores = questions.map((question) => {
    const stats = progress.questionStats[question.id];
    return {
      question,
      stats,
      score: getPriorityScore(stats),
      isMastered: stats ? isMastered(stats) : false,
    };
  });

  const unseen = questionsWithScores.filter((q) => !q.stats);
  const weak = questionsWithScores.filter(
    (q) =>
      q.stats &&
      !q.isMastered &&
      (q.stats.lastResult === "incorrect" ||
        q.stats.correct / q.stats.attempts < 0.6)
  );
  const review = questionsWithScores.filter(
    (q) => q.stats && !q.isMastered && !weak.includes(q)
  );
  const mastered = questionsWithScores.filter((q) => q.isMastered);

  const targetUnseen = Math.ceil(count * 0.4);
  const targetWeak = Math.ceil(count * 0.4);
  const targetReview = count - targetUnseen - targetWeak;

  const selected: typeof questionsWithScores = [];

  const sortedUnseen = unseen.sort((a, b) => b.score - a.score);
  selected.push(...sortedUnseen.slice(0, targetUnseen));

  const sortedWeak = weak.sort((a, b) => b.score - a.score);
  selected.push(...sortedWeak.slice(0, targetWeak));

  const sortedReview = review.sort((a, b) => b.score - a.score);
  selected.push(...sortedReview.slice(0, targetReview));

  if (selected.length < count) {
    const remaining = count - selected.length;
    const pool = [...unseen, ...weak, ...review, ...mastered].filter(
      (q) => !selected.includes(q)
    );
    const sortedPool = pool.sort((a, b) => b.score - a.score);
    selected.push(...sortedPool.slice(0, remaining));
  }

  const shuffled = shuffleArray(selected);

  return shuffled.slice(0, count).map((item) => item.question);
}
