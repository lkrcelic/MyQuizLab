import { getQuizById, getAllQuizzes } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import ReviewClient from "@/components/ReviewClient";

interface ReviewPageProps {
  params: Promise<{ quizSlug: string }>;
}

export function generateStaticParams() {
  const quizzes = getAllQuizzes();
  return quizzes.map((quiz) => ({ quizSlug: quiz.id }));
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { quizSlug } = await params;

  const quiz = getQuizById(quizSlug);
  if (!quiz) notFound();

  return <ReviewClient quiz={quiz} />;
}
