import { z } from "zod";
import type { Quiz } from "@/types/quiz";

const questionTypeSchema = z.enum([
  "what_does_it_do",
  "pick_correct",
  "detail_meaning",
  "type_answer",
]);

const difficultySchema = z.enum(["beginner", "intermediate", "advanced"]);

const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  isCorrect: z.boolean(),
  explanation: z.string().optional(),
});

const questionSchema = z.object({
  id: z.string(),
  type: questionTypeSchema,
  category: z.string(),
  difficulty: difficultySchema,
  prompt: z.string(),
  options: z.array(optionSchema).optional(),
  answer: z.string(),
  acceptedAnswers: z.array(z.string()).optional(),
  example: z.string().optional(),
  explanation: z.string(),
  tags: z.array(z.string()).optional(),
});

export const quizSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  questions: z.array(questionSchema),
});

export function parseQuiz(data: unknown): Quiz {
  return quizSchema.parse(data);
}
