import {
  pgTable,
  text,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import type { Difficulty, Option, QuestionType } from "@/types/quiz";

export type QuestionRating = "great" | "deleted" | null;

export const quizzes = pgTable("quizzes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  categories: jsonb("categories").$type<string[]>().notNull(),
});

export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  quizId: text("quiz_id")
    .notNull()
    .references(() => quizzes.id, { onDelete: "cascade" }),
  type: text("type").$type<QuestionType>().notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").$type<Difficulty>().notNull(),
  prompt: text("prompt").notNull(),
  answer: text("answer").notNull(),
  explanation: text("explanation").notNull(),
  options: jsonb("options").$type<Option[]>(),
  acceptedAnswers: jsonb("accepted_answers").$type<string[]>(),
  example: text("example"),
  tags: jsonb("tags").$type<string[]>(),
  rating: text("rating").$type<QuestionRating>(),
  ratedAt: timestamp("rated_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type QuizRow = typeof quizzes.$inferSelect;
export type QuestionRow = typeof questions.$inferSelect;
