import { getQuizIndex } from "@/lib/quizzes";
import HomeClient from "@/components/HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const quizzes = await getQuizIndex();
  const defaultQuiz = quizzes.length === 1 ? quizzes[0] : null;

  return <HomeClient quizzes={quizzes} defaultQuiz={defaultQuiz} />;
}
