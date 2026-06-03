export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function answersMatch(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return normalizeAnswer(userAnswer) === normalizeAnswer(correctAnswer);
}
