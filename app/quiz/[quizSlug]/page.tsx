import { getQuizById } from "@/lib/quizzes";
import { notFound } from "next/navigation";
import QuizSession from "@/components/QuizSession";

export const dynamic = "force-dynamic";

interface QuizPageProps {
  params: Promise<{ quizSlug: string }>;
  searchParams: Promise<{ mode?: string; count?: string }>;
}

export default async function QuizPage({ params, searchParams }: QuizPageProps) {
  const { quizSlug } = await params;
  const { mode, count } = await searchParams;

  const quiz = await getQuizById(quizSlug);
  if (!quiz) notFound();

  return (
    <QuizSession
      quiz={quiz}
      initialMode={mode || "smart"}
      initialCount={count || "5"}
    />
  );
}
