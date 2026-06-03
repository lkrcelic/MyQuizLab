import { describe, it, expect } from "vitest";
import { checkAnswer } from "@/lib/scoring";
import type { Question } from "@/types/quiz";

const mcQuestion: Question = {
  id: "mc-1",
  type: "pick_correct",
  category: "Test",
  difficulty: "beginner",
  prompt: "Pick the right one",
  options: [
    { id: "a", label: "Option A", isCorrect: true },
    { id: "b", label: "Option B", isCorrect: false },
  ],
  answer: "a",
  explanation: "A is correct.",
};

const typeQuestion: Question = {
  id: "type-1",
  type: "type_answer",
  category: "Test",
  difficulty: "beginner",
  prompt: "Type the command",
  answer: "systemctl status nginx",
  acceptedAnswers: [
    "sudo systemctl status nginx",
    "systemctl status nginx.service",
  ],
  explanation: "systemctl status shows service state.",
};

const typeQuestionNoAccepted: Question = {
  id: "type-2",
  type: "type_answer",
  category: "Test",
  difficulty: "beginner",
  prompt: "Type the command",
  answer: "pwd",
  explanation: "pwd shows current directory.",
};

describe("checkAnswer", () => {
  describe("multiple choice", () => {
    it("correct answer", () => {
      expect(checkAnswer(mcQuestion, "a")).toBe(true);
    });

    it("wrong answer", () => {
      expect(checkAnswer(mcQuestion, "b")).toBe(false);
    });

    it("non-existent option", () => {
      expect(checkAnswer(mcQuestion, "z")).toBe(false);
    });
  });

  describe("type_answer", () => {
    it("exact match", () => {
      expect(checkAnswer(typeQuestion, "systemctl status nginx")).toBe(true);
    });

    it("case-insensitive match", () => {
      expect(checkAnswer(typeQuestion, "Systemctl Status Nginx")).toBe(true);
    });

    it("match with extra spaces", () => {
      expect(checkAnswer(typeQuestion, "  systemctl  status  nginx  ")).toBe(true);
    });

    it("accepted alternative", () => {
      expect(checkAnswer(typeQuestion, "sudo systemctl status nginx")).toBe(true);
    });

    it("another accepted alternative", () => {
      expect(checkAnswer(typeQuestion, "systemctl status nginx.service")).toBe(true);
    });

    it("wrong answer", () => {
      expect(checkAnswer(typeQuestion, "systemctl restart nginx")).toBe(false);
    });

    it("works without acceptedAnswers", () => {
      expect(checkAnswer(typeQuestionNoAccepted, "pwd")).toBe(true);
      expect(checkAnswer(typeQuestionNoAccepted, "ls")).toBe(false);
    });
  });
});
