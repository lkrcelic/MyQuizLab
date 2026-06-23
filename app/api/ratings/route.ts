import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { questions } from "@/lib/db/schema";

const bodySchema = z.object({
  questionId: z.string().min(1),
  rating: z.enum(["great", "deleted"]).nullable(),
});

export async function POST(request: Request) {
  let parsed;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { questionId, rating } = parsed;

  const updated = await db
    .update(questions)
    .set({ rating, ratedAt: rating ? new Date() : null })
    .where(eq(questions.id, questionId))
    .returning({ id: questions.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, rating });
}
