import { describe, it, expect } from "vitest";
import { buildChatGPTUrl } from "@/lib/chatgpt-prompt";
import type { Question } from "@/types/quiz";

const mcQuestion: Question = {
  id: "grep-r-001",
  type: "detail_meaning",
  category: "Text Processing",
  difficulty: "intermediate",
  prompt: "What does the -r flag do in grep?",
  options: [
    { id: "a", label: "Search recursively", isCorrect: true, explanation: "..." },
    { id: "b", label: "Remove files", isCorrect: false },
  ],
  answer: "a",
  explanation: "grep -r searches recursively.",
};

const typeQuestion: Question = {
  id: "type-1",
  type: "type_answer",
  category: "Services",
  difficulty: "intermediate",
  prompt: "Type the command to check nginx status.",
  answer: "systemctl status nginx",
  explanation: "systemctl status shows service state.",
};

describe("buildChatGPTUrl", () => {
  it("returns a valid URL", () => {
    const url = buildChatGPTUrl(mcQuestion);
    expect(url).toContain("https://chatgpt.com/");
    expect(url).toContain("temporary-chat=true");
  });

  it("resolves MC option label in URL", () => {
    const url = buildChatGPTUrl(mcQuestion);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Search recursively");
    expect(decoded).not.toContain('"a"');
  });

  it("includes question prompt in URL", () => {
    const url = buildChatGPTUrl(mcQuestion);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("What does the -r flag do in grep?");
  });

  it("uses raw answer for type_answer questions", () => {
    const url = buildChatGPTUrl(typeQuestion);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("systemctl status nginx");
  });

  it("includes structured prompt sections", () => {
    const url = buildChatGPTUrl(mcQuestion);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("What it does and why it's useful");
    expect(decoded).toContain("A practical example with expected output");
    expect(decoded).toContain("Common mistakes or gotchas");
    expect(decoded).toContain("One small practice exercise I can try");
  });

  it("URL is properly encoded", () => {
    const url = buildChatGPTUrl(mcQuestion);
    expect(url).not.toContain(" ");
    expect(url).toContain("%20");
  });
});
