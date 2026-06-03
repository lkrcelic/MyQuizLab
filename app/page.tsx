import { getQuizIndex } from "@/lib/quizzes";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  const quizzes = getQuizIndex();
  const defaultQuiz = quizzes.length === 1 ? quizzes[0] : null;

  return <HomeClient quizzes={quizzes} defaultQuiz={defaultQuiz} />;
}
