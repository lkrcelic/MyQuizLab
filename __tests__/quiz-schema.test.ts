import { describe, it, expect } from "vitest";
import { parseQuiz, quizSchema } from "@/lib/quiz-schema";

const validQuiz = {
  id: "test-quiz",
  title: "Test Quiz",
  description: "A test quiz.",
  categories: ["Cat A"],
  questions: [
    {
      id: "q1",
      type: "pick_correct",
      category: "Cat A",
      difficulty: "beginner",
      prompt: "What is 2+2?",
      options: [
        { id: "a", label: "4", isCorrect: true, explanation: "Basic math" },
        { id: "b", label: "5", isCorrect: false },
      ],
      answer: "a",
      explanation: "2+2 equals 4.",
    },
  ],
};

describe("quiz-schema", () => {
  it("parses a valid quiz", () => {
    const result = parseQuiz(validQuiz);
    expect(result.id).toBe("test-quiz");
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].type).toBe("pick_correct");
  });

  it("accepts all question types", () => {
    const types = ["what_does_it_do", "pick_correct", "detail_meaning", "type_answer"];
    for (const type of types) {
      const quiz = {
        ...validQuiz,
        questions: [{ ...validQuiz.questions[0], type }],
      };
      expect(() => parseQuiz(quiz)).not.toThrow();
    }
  });

  it("accepts all difficulty levels", () => {
    for (const difficulty of ["beginner", "intermediate", "advanced"]) {
      const quiz = {
        ...validQuiz,
        questions: [{ ...validQuiz.questions[0], difficulty }],
      };
      expect(() => parseQuiz(quiz)).not.toThrow();
    }
  });

  it("accepts optional fields", () => {
    const quiz = {
      ...validQuiz,
      questions: [
        {
          ...validQuiz.questions[0],
          acceptedAnswers: ["four", "4"],
          example: "2 + 2 = 4",
          tags: ["math", "basic"],
        },
      ],
    };
    const result = parseQuiz(quiz);
    expect(result.questions[0].acceptedAnswers).toEqual(["four", "4"]);
    expect(result.questions[0].tags).toEqual(["math", "basic"]);
  });

  it("rejects quiz with missing id", () => {
    const { id, ...noId } = validQuiz;
    expect(() => parseQuiz(noId)).toThrow();
  });

  it("rejects quiz with missing title", () => {
    const { title, ...noTitle } = validQuiz;
    expect(() => parseQuiz(noTitle)).toThrow();
  });

  it("rejects quiz with missing questions", () => {
    const { questions, ...noQuestions } = validQuiz;
    expect(() => parseQuiz(noQuestions)).toThrow();
  });

  it("rejects question with invalid type", () => {
    const quiz = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], type: "invalid_type" }],
    };
    expect(() => parseQuiz(quiz)).toThrow();
  });

  it("rejects question with invalid difficulty", () => {
    const quiz = {
      ...validQuiz,
      questions: [{ ...validQuiz.questions[0], difficulty: "expert" }],
    };
    expect(() => parseQuiz(quiz)).toThrow();
  });

  it("rejects question with missing explanation", () => {
    const { explanation, ...noExplanation } = validQuiz.questions[0];
    const quiz = { ...validQuiz, questions: [noExplanation] };
    expect(() => parseQuiz(quiz)).toThrow();
  });

  it("rejects entirely invalid data", () => {
    expect(() => parseQuiz(null)).toThrow();
    expect(() => parseQuiz("string")).toThrow();
    expect(() => parseQuiz(42)).toThrow();
    expect(() => parseQuiz({})).toThrow();
  });
});
