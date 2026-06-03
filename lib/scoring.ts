import type { Question } from "@/types/quiz";
import { answersMatch } from "@/lib/answer-normalization";

export function checkAnswer(question: Question, userAnswer: string): boolean {
  if (question.type === "type_answer") {
    if (answersMatch(userAnswer, question.answer)) {
      return true;
    }

    if (question.acceptedAnswers) {
      return question.acceptedAnswers.some((accepted) =>
        answersMatch(userAnswer, accepted)
      );
    }

    return false;
  }

  return userAnswer === question.answer;
}
