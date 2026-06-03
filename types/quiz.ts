export type QuestionType =
  | "what_does_it_do"
  | "pick_correct"
  | "detail_meaning"
  | "type_answer";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Option = {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation?: string;
};

export type Question = {
  id: string;
  type: QuestionType;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  options?: Option[];
  answer: string;
  acceptedAnswers?: string[];
  example?: string;
  explanation: string;
  tags?: string[];
};

export type Quiz = {
  id: string;
  title: string;
  description: string;
  categories: string[];
  questions: Question[];
};
