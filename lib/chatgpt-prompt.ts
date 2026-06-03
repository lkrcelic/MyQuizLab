import type { Question } from "@/types/quiz";

function resolveCorrectAnswerLabel(question: Question): string {
  if (question.options) {
    const correctOption = question.options.find(
      (opt) => opt.id === question.answer
    );
    if (correctOption) return correctOption.label;
  }

  return question.answer;
}

export function buildChatGPTUrl(question: Question): string {
  const correctLabel = resolveCorrectAnswerLabel(question);

  const prompt = `Explain this in simple terms:

Question: ${question.prompt}
Correct answer: ${correctLabel}

Please explain:
1. What it does and why it's useful
2. A practical example with expected output
3. Common mistakes or gotchas
4. One small practice exercise I can try`;

  const encoded = encodeURIComponent(prompt);

  return `https://chatgpt.com/?temporary-chat=true&q=${encoded}`;
}
