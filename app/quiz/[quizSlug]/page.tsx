import { getQuizById, getAllQuizzes } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import QuizSession from "@/components/QuizSession";

interface QuizPageProps {
  params: Promise<{ quizSlug: string }>;
  searchParams: Promise<{ mode?: string; count?: string }>;
}

export function generateStaticParams() {
  const quizzes = getAllQuizzes();
  return quizzes.map((quiz) => ({ quizSlug: quiz.id }));
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quizSlug } = await params;
  const { mode, count } = await searchParams;

  const quiz = getQuizById(quizSlug);
  if (!quiz) notFound();

  return (
    <QuizSession
      quiz={quiz}
      initialMode={mode || "smart"}
      initialCount={count || "5"}
    />
  );
}
