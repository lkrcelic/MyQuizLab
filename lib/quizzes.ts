import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { parseQuiz } from "@/lib/quiz-schema";
import type { Quiz } from "@/types/quiz";

const QUIZZES_DIR = join(process.cwd(), "content", "quizzes");

export function getAllQuizzes(): Quiz[] {
  const quizzes: Quiz[] = [];

  try {
    const files = readdirSync(QUIZZES_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    for (const file of jsonFiles) {
      try {
        const filePath = join(QUIZZES_DIR, file);
        const fileContent = readFileSync(filePath, "utf-8");
        const data = JSON.parse(fileContent);
        const quiz = parseQuiz(data);
        quizzes.push(quiz);
      } catch (error) {
        console.warn(`Failed to load quiz from ${file}:`, error);
      }
    }
  } catch (error) {
    console.error("Failed to read quizzes directory:", error);
  }

  return quizzes;
}

export function getQuizById(id: string): Quiz | null {
  const quizzes = getAllQuizzes();
  return quizzes.find((quiz) => quiz.id === id) || null;
}

export function getQuizIndex(): Array<{
  id: string;
  title: string;
  description: string;
}> {
  const quizzes = getAllQuizzes();
  return quizzes.map((quiz) => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
  }));
}
