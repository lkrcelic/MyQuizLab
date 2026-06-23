import { and, eq, ne, or, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions as questionsTable, quizzes as quizzesTable } from "@/lib/db/schema";
import type { QuestionRow, QuizRow } from "@/lib/db/schema";
import type { Question, Quiz } from "@/types/quiz";

// Soft-hide: include questions that are not marked "deleted".
const notDeleted = or(
  isNull(questionsTable.rating),
  ne(questionsTable.rating, "deleted")
);

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    type: row.type,
    category: row.category,
    difficulty: row.difficulty,
    prompt: row.prompt,
    answer: row.answer,
    explanation: row.explanation,
    options: row.options ?? undefined,
    acceptedAnswers: row.acceptedAnswers ?? undefined,
    example: row.example ?? undefined,
    tags: row.tags ?? undefined,
    rating: row.rating ?? null,
  };
}

function mapQuiz(quiz: QuizRow, rows: QuestionRow[]): Quiz {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    categories: quiz.categories,
    questions: rows.map(mapQuestion),
  };
}

export async function getAllQuizzes(): Promise<Quiz[]> {
  const [quizRows, questionRows] = await Promise.all([
    db.select().from(quizzesTable),
    db.select().from(questionsTable).where(notDeleted),
  ]);

  return quizRows.map((quiz) =>
    mapQuiz(
      quiz,
      questionRows.filter((q) => q.quizId === quiz.id)
    )
  );
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const quizRows = await db
    .select()
    .from(quizzesTable)
    .where(eq(quizzesTable.id, id));

  const quiz = quizRows[0];
  if (!quiz) return null;

  const questionRows = await db
    .select()
    .from(questionsTable)
    .where(and(eq(questionsTable.quizId, id), notDeleted));

  return mapQuiz(quiz, questionRows);
}

export async function getQuizIndex(): Promise<
  Array<{ id: string; title: string; description: string }>
> {
  const quizRows = await db
    .select({
      id: quizzesTable.id,
      title: quizzesTable.title,
      description: quizzesTable.description,
    })
    .from(quizzesTable);

  return quizRows;
}
