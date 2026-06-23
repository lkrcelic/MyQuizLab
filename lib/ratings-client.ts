import type { Rating } from "@/types/quiz";

export async function setRating(
  questionId: string,
  rating: Rating
): Promise<void> {
  const res = await fetch("/api/ratings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, rating }),
  });

  if (!res.ok) {
    throw new Error(`Failed to save rating (${res.status})`);
  }
}
