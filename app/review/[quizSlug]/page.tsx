import { getQuizById } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import ReviewClient from "@/components/ReviewClient";

export const dynamic = "force-dynamic";

interface ReviewPageProps {
  params: Promise<{ quizSlug: string }>;
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { quizSlug } = await params;

  const quiz = await getQuizById(quizSlug);
  if (!quiz) notFound();

  return <ReviewClient quiz={quiz} />;
}
