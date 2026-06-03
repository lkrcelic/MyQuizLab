import { describe, it, expect } from "vitest";
import { normalizeAnswer, answersMatch } from "@/lib/answer-normalization";

describe("normalizeAnswer", () => {
  it("trims whitespace", () => {
    expect(normalizeAnswer("  hello  ")).toBe("hello");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeAnswer("hello   world")).toBe("hello world");
  });

  it("lowercases input", () => {
    expect(normalizeAnswer("Hello World")).toBe("hello world");
  });

  it("handles tabs and newlines", () => {
    expect(normalizeAnswer("hello\t\nworld")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(normalizeAnswer("")).toBe("");
  });

  it("handles only whitespace", () => {
    expect(normalizeAnswer("   ")).toBe("");
  });

  it("combined: trim + collapse + lowercase", () => {
    expect(normalizeAnswer("  Systemctl   Status   NGINX  ")).toBe("systemctl status nginx");
  });
});

describe("answersMatch", () => {
  it("matches identical strings", () => {
    expect(answersMatch("hello", "hello")).toBe(true);
  });

  it("matches case-insensitive", () => {
    expect(answersMatch("Hello", "hello")).toBe(true);
  });

  it("matches with extra whitespace", () => {
    expect(answersMatch("  hello  world  ", "hello world")).toBe(true);
  });

  it("rejects different strings", () => {
    expect(answersMatch("hello", "world")).toBe(false);
  });

  it("matches typical command input", () => {
    expect(answersMatch("systemctl status nginx", "Systemctl Status Nginx")).toBe(true);
  });

  it("matches with leading/trailing spaces", () => {
    expect(answersMatch("  pwd  ", "pwd")).toBe(true);
  });
});
