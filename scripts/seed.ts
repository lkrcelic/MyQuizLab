import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";
import { db } from "../lib/db/index";
import { quizzes, questions } from "../lib/db/schema";
import { parseQuiz } from "../lib/quiz-schema";

// Load .env.local for local runs. On Vercel, DATABASE_URL is already in the env.
// The DB client (lib/db) is lazy, so the imports above don't read env or connect —
// the connection string is only needed when seed() runs its first query, which is
// after this call. (Static imports avoid top-level await, unsupported under CJS.)
config({ path: ".env.local" });

const QUIZZES_DIR = join(process.cwd(), "content", "quizzes");

// Append-only seed: the DB is the source of truth. Existing quizzes/questions
// (and their ratings + any edits made in the DB) are never touched. Only rows
// that don't yet exist are inserted, so JSON acts as an "add new questions"
// channel and a one-time bootstrap for a fresh database.
async function seed() {
  const files = readdirSync(QUIZZES_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} quiz file(s).`);

  let newQuizzes = 0;
  let newQuestions = 0;

  for (const file of files) {
    const data = JSON.parse(readFileSync(join(QUIZZES_DIR, file), "utf-8"));
    const quiz = parseQuiz(data);

    const insertedQuiz = await db
      .insert(quizzes)
      .values({
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        categories: quiz.categories,
      })
      .onConflictDoNothing({ target: quizzes.id })
      .returning({ id: quizzes.id });
    newQuizzes += insertedQuiz.length;

    let added = 0;
    for (const q of quiz.questions) {
      const insertedQuestion = await db
        .insert(questions)
        .values({
          id: q.id,
          quizId: quiz.id,
          type: q.type,
          category: q.category,
          difficulty: q.difficulty,
          prompt: q.prompt,
          answer: q.answer,
          explanation: q.explanation,
          options: q.options ?? null,
          acceptedAnswers: q.acceptedAnswers ?? null,
          example: q.example ?? null,
          tags: q.tags ?? null,
        })
        .onConflictDoNothing({ target: questions.id })
        .returning({ id: questions.id });
      added += insertedQuestion.length;
    }
    newQuestions += added;

    console.log(
      `"${quiz.title}": ${added} new question(s) added (${quiz.questions.length} in JSON).`
    );
  }

  console.log(
    `Done. ${newQuizzes} new quiz(zes), ${newQuestions} new question(s) inserted.`
  );
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
