# MyQuizLab — MVP Technical & Product Specification

## 0. Purpose of This Document

This document is written as a planning specification for an LLM or developer to generate an implementation plan.

The goal is to build a mobile-first, PWA-ready quiz app that can be deployed to Vercel. The MVP should stay simple, use local JSON quiz files, and remember user progress locally across sessions.

---

## 1. Product Summary

The app is a web-based quiz tool for learning any topic in small time gaps throughout the day.

The app should feel like a lightweight learning companion, not a complicated course platform. The default experience should require as few clicks as possible: open the app, start the default quiz, answer a few questions, learn from explanations, and continue later.

The architecture is topic-agnostic. Each quiz is a self-contained JSON file that defines its own topic, categories, and questions. The first shipped quiz may cover Ubuntu terminal commands, but the platform supports any subject (networking, Docker, Git, cloud services, programming languages, etc.). Future versions may support multiple custom quizzes, larger question banks, AI-assisted question generation, database-backed quizzes, and MCP-based access to quiz data.

---

## 2. Core MVP Goals

The MVP must:

1. Be mobile-first.
2. Be installable as a PWA.
3. Be deployable to Vercel.
4. Use local JSON files for quiz content.
5. Default to Smart Practice mode.
6. Default to 5 questions per quiz session.
7. Remember question performance across sessions on the same device.
8. Prioritize questions the user has not practiced, answered incorrectly, or answered the fewest times.
9. Show detailed explanations after each answered question.
10. Provide a review page for browsing and studying all questions/topics.

---

## 3. Recommended Tech Stack

### Framework

Use **Next.js with App Router**.

Reasons:

- Works naturally with Vercel.
- Supports static pages for the MVP.
- Supports API routes later for AI/database features.
- Can evolve into a full-stack app without changing the frontend framework.

### Language

Use **TypeScript**.

Reasons:

- Safer data handling.
- Stronger quiz/question types.
- Easier future migration from JSON to database.
- Better compatibility with Zod validation.

### Styling

Use **Tailwind CSS**.

Reasons:

- Fast UI development.
- Good for mobile-first layouts.
- Easy to create themed styling for any quiz topic.

### UI Components

Use custom components first.

Optional later:

- shadcn/ui for dialog/modal primitives, buttons, cards, forms, drawers, and command menus.

### Data Storage for MVP

Use local JSON files.

One quiz should equal one JSON file.

Example:

```txt
content/
  quizzes/
    sample-quiz.json
```

This keeps the MVP simple and version-controlled.

### Quiz Discovery

At build time, `lib/quizzes.ts` should read all `.json` files from `content/quizzes/` and expose them as a quiz index (list of available quizzes with id, title, description). This allows the homepage and quiz selection to know which quizzes exist without hardcoding file names.

If only one quiz file exists, the app should skip any quiz selection UI and use it directly.

### Runtime Validation

Use **Zod** to validate quiz JSON files.

The app should fail gracefully if quiz content is malformed.

### Client State

Use React state for quiz session state.

Optional later:

- Zustand, only if quiz/session/progress state becomes too complex.

### Progress Persistence

Use `localStorage` for MVP progress persistence.

Persist:

- Question attempts
- Correct count
- Incorrect count
- Last result
- Current streaks
- Last answered timestamp
- Last selected quiz settings if needed

Future upgrade path:

1. `localStorage` for MVP
2. IndexedDB for richer offline/client-side data
3. Postgres/Supabase/Neon/Vercel Postgres for account-based sync

### Deployment

Deploy to **Vercel**.

---

### URL Routing

| Route | Purpose |
|-------|---------|
| `/` | Homepage with start CTA |
| `/quiz/[quizId]` | Active quiz session |
| `/review/[quizId]` | Review/study page for a quiz |

Notes:

- `quizId` is the quiz's `id` field from the JSON file (e.g. `my-first-quiz`).
- The quiz session state is purely client-side (React state). No URL params per question.
- If the user navigates away mid-quiz, the session is lost. In-progress session persistence is not an MVP requirement.
- If only one quiz exists, the homepage CTA should link directly to `/quiz/<that-quiz-id>`.

---

## 4. MVP Scope

The first version should include the following features.

### 4.1 Homepage

The homepage should include:

- App title
- Short quiz introduction
- Primary CTA: `Start Smart Practice` (immediately starts a 5-question Smart Practice session)
- Small secondary link: `Custom session` — reveals an inline panel for choosing mode and question count
- Link to review page

The homepage should optimize for low-friction usage. The default action should immediately start a 5-question Smart Practice session with zero configuration.

Default homepage behavior:

```txt
Open app -> tap Start Smart Practice -> answer 5 questions
```

The user should not be forced to configure mode or question count before starting.

If the user taps "Custom session", an inline panel expands (not a new page) with:

- Mode selector (Smart Practice selected by default)
- Question count selector (5 selected by default)
- Start button

---

### 4.2 Quiz Selection

For MVP, there may be only one quiz loaded from a single JSON file.

However, the app architecture should support multiple quizzes later.

Potential future examples:

```txt
Ubuntu Terminal Commands
Git Basics
Docker Basics
Networking Basics
Kubernetes Fundamentals
Python Standard Library
```

Quiz selection should not block the default flow. If there is only one quiz, it should be selected automatically.

---

### 4.3 Quiz Modes

Supported modes:

```txt
Smart Practice
Mixed
What does it do?
Pick the correct
Detail meaning
Type the answer
```

#### Default Mode

The default mode must be:

```txt
Smart Practice
```

Smart Practice should be visually emphasized as the recommended/default mode.

#### Smart Practice Mode

Smart Practice selects questions based on saved local progress.

It should prioritize:

1. Questions never answered before
2. Questions answered incorrectly last time
3. Questions with low accuracy
4. Questions with few total attempts
5. Random review questions for variety

Smart Practice exists because the app is intended for short learning sessions throughout the day.

---

### 4.4 Question Count Selection

Supported question counts:

```txt
5
10
20
All
```

#### Default Question Count

The default question count must be:

```txt
5
```

The 5-question default is important because the app is designed for small time gaps during the day.

The UI should allow the user to change the count, but the default path should not require changing it.

---

### 4.5 Quiz Screen

The quiz screen should include:

- Current question number
- Total question count
- Question prompt
- Answer choices or text input, depending on question type
- Submit/check answer action
- Immediate result feedback after answering
- Explanation modal after answer submission
- Next question action

The quiz screen should be optimized for one-handed mobile use.

Important mobile UX details:

- Large tap targets
- Minimal text clutter
- Sticky bottom action button if useful
- Progress indicator visible but not dominant
- Clean visual style (optionally terminal-inspired per quiz theme)
- No unnecessary navigation during active quiz

---

## 5. Post-Answer Explanation Modal

After the user answers any question, the app should show a detailed explanation modal.

This is a key UX feature.

### 5.1 Modal Behavior

The modal should open after the answer is submitted.

It should cover most of the screen, especially on mobile.

It should feel like an expanded learning card, not a tiny popup.

On mobile:

- Use a full-screen or near-full-screen modal/drawer.
- Keep the content scrollable.
- Keep the primary action visible near the bottom.

### 5.2 Modal Content

The modal should show:

- Whether the answer was correct or incorrect
- The user's selected answer
- The correct answer
- **Extra description/explanation only for the correct answer**
- Example (command example, code snippet, or usage example depending on topic)
- Category
- Difficulty
- Related items if available
- **"Ask more on ChatGPT" button** (see Section 6)

The modal does NOT need to show explanations for every wrong option. Only the correct answer gets the extra description. This keeps the modal focused and concise.

### 5.3 Explanation Approach

The extra description is stored in the `explanation` field of the correct answer option (for multiple-choice) or in the top-level `explanation` field (for all question types).

This approach applies uniformly across all question types:

- **Multiple choice / pick_correct** — show the correct option's `explanation` field
- **Type the answer (type_answer)** — show the top-level `explanation` field for the correct answer
- **Detail meaning (detail_meaning)** — show the correct option's `explanation` field
- **What does it do (what_does_it_do)** — show the correct option's `explanation` field

Recommended JSON format for multiple-choice questions:

```json
{
  "id": "grep-r-001",
  "type": "detail_meaning",
  "category": "Files & Search",
  "difficulty": "intermediate",
  "prompt": "What does the -r flag do in grep?",
  "options": [
    {
      "id": "a",
      "label": "Search recursively",
      "isCorrect": true,
      "explanation": "The -r flag makes grep search inside directories recursively, descending into subdirectories to find matches."
    },
    {
      "id": "b",
      "label": "Remove matching files",
      "isCorrect": false
    },
    {
      "id": "c",
      "label": "Restart a process",
      "isCorrect": false
    },
    {
      "id": "d",
      "label": "Rename matching files",
      "isCorrect": false
    }
  ],
  "answer": "a",
  "example": "grep -r \"error\" /var/log",
  "explanation": "grep searches for matching text. With -r, it searches recursively through directories.",
  "tags": ["grep", "search", "recursive"]
}
```

Recommended JSON format for non-multiple-choice (type_answer) questions:

```json
{
  "id": "systemctl-status-nginx-001",
  "type": "type_answer",
  "category": "Services",
  "difficulty": "intermediate",
  "prompt": "Type the command to check the status of the nginx service.",
  "answer": "systemctl status nginx",
  "acceptedAnswers": [
    "sudo systemctl status nginx",
    "systemctl status nginx.service"
  ],
  "example": "systemctl status nginx",
  "explanation": "systemctl status shows the current state and recent logs for a systemd service. This is the standard way to check whether a service is running, stopped, or failed.",
  "tags": ["systemctl", "services", "nginx"]
}
```

Only the correct answer's explanation is displayed in the modal. Wrong options do not require an `explanation` field (it is optional and ignored in the modal).

---

## 6. "Ask More on ChatGPT" Button

Every explanation modal must include a prominent button/link that lets the user ask more about the correct answer via a ChatGPT temporary chat.

### 6.1 Button Placement & Label

The button should appear inside the explanation modal, clearly visible (not hidden in a menu).

Recommended label:

```txt
Ask more on ChatGPT
```

It should be styled as a secondary action link/button (not the primary "Continue" CTA).

### 6.2 MVP Behavior

When the user taps the button:

1. Open a **ChatGPT temporary chat** in a new browser tab with a pre-filled prompt.
2. The URL format for temporary chat with a pre-filled prompt is:

```txt
https://chatgpt.com/?temporary-chat=true&q=<URL-encoded prompt>
```

This opens ChatGPT in temporary-chat mode so the conversation is not saved to the user's history.

### 6.3 Generated Prompt

The prompt should be generated dynamically from the question context. It should ask ChatGPT to explain more about the **correct answer**.

Example generated prompt (before URL encoding):

```txt
Explain this in simple terms:

Question: What does the -r flag do in grep?
Correct answer: Search recursively

Please explain:
1. What it does and why it's useful
2. A practical example with expected output
3. Common mistakes or gotchas
4. One small practice exercise I can try
```

The prompt should be generic enough to work for any quiz topic (not hardcoded to terminal commands).

### 6.4 Implementation

Create a helper function in `lib/chatgpt-prompt.ts`.

It should:

1. Accept question data (prompt, correct answer label, explanation, example, tags).
2. For multiple-choice questions, resolve the `answer` option ID (e.g. `"a"`) to the correct option's `label` text (e.g. `"Search recursively"`).
3. Build a natural-language prompt string.
4. URL-encode the prompt.
5. Return the full temporary-chat URL.

The button in the modal simply opens this URL in a new tab.

---

## 7. Score and Results Screen

After the quiz ends, show a results screen.

The results screen should include:

- Score
- Correct count
- Incorrect count
- Number of new/unseen questions practiced
- Number of weak questions practiced
- Number of questions improved
- Retry missed questions button
- Start another Smart Practice button
- Link to review page

Primary CTA after results:

```txt
Practice 5 more
```

Secondary CTA:

```txt
Retry missed
```

The results screen should continue the low-friction learning loop.

---

## 8. Retry Missed Questions

The app should support two kinds of missed-question retry.

### 8.1 Retry Missed From Current Session

After a quiz session, the user can retry only the questions they answered incorrectly in that session.

### 8.2 Practice Historical Weak Questions

Smart Practice should automatically include questions the user has answered incorrectly in previous sessions.

This is not the same as session retry. It uses saved local performance stats.

---

## 9. Review Page

The review page is a study/reference page for browsing the quiz content outside of active quiz mode.

### 9.1 Purpose

The review page should let users learn and revise topics without answering questions.

It should work like a mini reference plus personal progress dashboard.

### 9.2 Content

The page should show:

- All questions/items in the quiz
- Categories
- Descriptions
- Example usage
- Additional details (e.g., flag explanations for CLI topics, code snippets for programming topics)
- Related items
- Personal performance status for each question

### 9.3 Progress Status Labels

Each item can have a status based on local progress:

```txt
Unseen
Needs practice
Recently missed
Learning
Mastered
```

### 9.4 Filters

MVP filters:

```txt
All
Unseen
Needs practice
Mastered
Recently missed
Category
```

### 9.5 Mobile UI

On mobile, the review page should use compact cards.

Each card should show:

- Question/item title
- Short description
- Status badge
- Category
- Expand/collapse details

The review page is not the primary flow, but it should be useful when the user wants to study instead of quiz.

---

## 10. Progress Memorization

The app must remember question performance across sessions on the same device.

For MVP, use `localStorage`.

This is permanent enough for the MVP because it survives refreshes, browser restarts, and PWA reopening. It is not account-based sync and can be cleared if the user clears site data.

---

### 10.1 Progress Storage Scope

Progress should be stored by:

```txt
quizId + questionId
```

Each question must have a stable unique ID.

Example:

```json
{
  "id": "quiz-topic-question-001"
}
```

Never generate random IDs at runtime for existing questions.

---

### 10.2 Stored Progress Data Structure

Recommended localStorage object:

```json
{
  "quizzes": {
    "my-first-quiz": {
      "questionStats": {
        "grep-recursive-001": {
          "attempts": 5,
          "correct": 3,
          "incorrect": 2,
          "lastResult": "incorrect",
          "currentCorrectStreak": 0,
          "currentIncorrectStreak": 1,
          "lastAnsweredAt": "2026-06-03T14:20:00.000Z"
        }
      }
    }
  }
}
```

---

### 10.3 Question Stats Type

Use this TypeScript type:

```ts
type QuestionStats = {
  attempts: number;
  correct: number;
  incorrect: number;
  lastResult: "correct" | "incorrect" | null;
  currentCorrectStreak: number;
  currentIncorrectStreak: number;
  lastAnsweredAt: string | null;
};
```

---

### 10.4 Recording an Answer

When the user answers a question:

If correct:

```txt
attempts + 1
correct + 1
lastResult = correct
currentCorrectStreak + 1
currentIncorrectStreak = 0
lastAnsweredAt = now
```

If incorrect:

```txt
attempts + 1
incorrect + 1
lastResult = incorrect
currentIncorrectStreak + 1
currentCorrectStreak = 0
lastAnsweredAt = now
```

---

## 11. Smart Practice Selection Algorithm

Smart Practice should not be purely random.

It should prioritize:

1. Unseen questions
2. Questions answered incorrectly last time
3. Questions with low accuracy
4. Questions with few total attempts
5. Random review questions

---

### 11.1 Recommended Distribution for 5-Question Default

For the default 5-question session:

```txt
2 unseen or least-attempted questions
2 weak/incorrect/low-accuracy questions
1 random review question
```

If there are not enough questions in one bucket, fill from the next best bucket.

---

### 11.2 Priority Score Formula

Use a simple priority score.

Example:

```ts
function getPriorityScore(stats?: QuestionStats) {
  if (!stats) return 100;

  const accuracy = stats.attempts === 0
    ? 0
    : stats.correct / stats.attempts;

  let score = 0;

  if (stats.attempts === 0) score += 100;
  if (stats.lastResult === "incorrect") score += 80;
  if (accuracy < 0.5) score += 50;
  if (stats.attempts < 3) score += 30;
  if (stats.currentIncorrectStreak > 1) score += 30;

  return score;
}
```

Then sort by score, choose the highest-priority questions, and shuffle lightly so the experience does not feel too predictable.

---

### 11.3 Mastery Definition

A question can be considered mastered when:

```txt
correct >= 3
currentCorrectStreak >= 3
accuracy >= 80%
```

Example:

```ts
function isMastered(stats: QuestionStats) {
  if (!stats || stats.attempts === 0) return false;

  const accuracy = stats.correct / stats.attempts;

  return (
    stats.correct >= 3 &&
    stats.currentCorrectStreak >= 3 &&
    accuracy >= 0.8
  );
}
```

Mastered questions should appear less often in Smart Practice, but not disappear forever.

---

## 11.4 Error & Empty States

The app should handle edge cases gracefully:

- **Quiz JSON fails validation** — Show a simple error message: "This quiz could not be loaded. The quiz file may be corrupted." Do not crash.
- **No questions match the selected mode** — Show: "No questions available for this mode." Offer to switch to Smart Practice or Mixed.
- **All questions are mastered** — Smart Practice should still work. Mastered questions are deprioritized but never excluded. The user should always be able to start a quiz.
- **localStorage unavailable** — The app should still work for a single session. Progress simply won't persist. Show a subtle warning: "Progress cannot be saved in this browser mode."

---

## 12. Quiz JSON Data Model

Each quiz should be a JSON file.

Recommended quiz structure:

```json
{
  "id": "my-first-quiz",
  "title": "My Quiz Title",
  "description": "A short description of what this quiz covers.",
  "categories": [
    "Category A",
    "Category B",
    "Category C"
  ],
  "questions": []
}
```

The quiz structure is intentionally generic. Each quiz JSON file defines its own title, description, and categories. This makes it easy to create quizzes for any topic.

### 12.1 TypeScript Types (Source of Truth for Zod Schema)

These types define the contract for `lib/quiz-schema.ts`:

```ts
type QuestionType =
  | "what_does_it_do"
  | "pick_correct"
  | "detail_meaning"
  | "type_answer";

type Difficulty = "beginner" | "intermediate" | "advanced";

type Option = {
  id: string;                  // required, e.g. "a", "b", "c", "d"
  label: string;               // required, display text
  isCorrect: boolean;          // required
  explanation?: string;        // optional, only meaningful on the correct option
};

type Question = {
  id: string;                  // required, stable unique ID
  type: QuestionType;          // required
  category: string;            // required
  difficulty: Difficulty;      // required
  prompt: string;              // required, the question text
  options?: Option[];          // required for MC types, absent for type_answer
  answer: string;              // required, correct answer (option id for MC, text for type_answer)
  acceptedAnswers?: string[];  // optional, alternative correct texts for type_answer
  example?: string;            // optional, usage example
  explanation: string;         // required, shown in the modal for the correct answer
  tags?: string[];             // optional, for search/filtering/ChatGPT prompt
};

type Quiz = {
  id: string;                  // required, unique quiz identifier
  title: string;               // required
  description: string;         // required
  categories: string[];        // required, list of category names
  questions: Question[];       // required
};
```

---

### 12.2 Question JSON Examples

Recommended question structure:

```json
{
  "id": "grep-recursive-001",
  "type": "detail_meaning",
  "category": "Files & Search",
  "difficulty": "intermediate",
  "prompt": "What does the -r flag do in grep?",
  "options": [
    {
      "id": "a",
      "label": "Search recursively",
      "isCorrect": true,
      "explanation": "The -r flag makes grep search inside directories recursively."
    },
    {
      "id": "b",
      "label": "Remove files recursively",
      "isCorrect": false
    }
  ],
  "answer": "a",
  "acceptedAnswers": [],
  "example": "grep -r \"error\" /var/log",
  "explanation": "grep searches for matching text. With -r, it searches recursively through directories.",
  "tags": ["grep", "search", "recursive"]
}
```

---

### 12.3 Type Answer Questions

For typed answer questions, support accepted answers.

Example:

```json
{
  "id": "systemctl-status-nginx-001",
  "type": "type_answer",
  "category": "Services",
  "difficulty": "intermediate",
  "prompt": "Type the command to check the status of the nginx service.",
  "answer": "systemctl status nginx",
  "acceptedAnswers": [
    "sudo systemctl status nginx",
    "systemctl status nginx.service",
    "sudo systemctl status nginx.service"
  ],
  "example": "systemctl status nginx",
  "explanation": "systemctl status shows the current status and recent logs for a service.",
  "tags": ["systemctl", "services", "nginx"]
}
```

Typed answers should be normalized before checking:

- Trim whitespace
- Collapse repeated spaces
- Case-insensitive comparison (configurable per question if needed)

---

## 13. Suggested Project Structure

```txt
app/
  page.tsx
  quiz/[quizSlug]/page.tsx
  review/[quizSlug]/page.tsx
  manifest.ts

components/
  QuizShell.tsx
  QuestionCard.tsx
  AnswerOptions.tsx
  TypeAnswerInput.tsx
  ExplanationModal.tsx
  QuizResults.tsx
  QuizModeSelector.tsx
  QuestionCountSelector.tsx
  ReviewCard.tsx

content/
  quizzes/
    sample-quiz.json

lib/
  quizzes.ts
  quiz-schema.ts
  scoring.ts
  shuffle.ts
  smart-practice.ts
  progress-store.ts
  answer-normalization.ts
  chatgpt-prompt.ts

public/
  icons/
    icon-192.png
    icon-512.png

styles/
  globals.css

types/
  quiz.ts
  progress.ts
```

---

## 14. PWA Requirements

The app should be installable as a PWA.

MVP PWA requirements:

- Web app manifest
- App name and short name
- Theme color matching the app design
- Icons for installability
- Mobile-friendly viewport
- Offline-friendly static content where possible
- App shell should load quickly

Example manifest values:

```json
{
  "name": "MyQuizLab",
  "short_name": "QuizLab",
  "description": "Practice any topic in short quiz sessions.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#111111",
  "theme_color": "#E95420",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

Optional later:

- Service worker caching
- Offline quiz access
- IndexedDB progress backup/export

---

## 15. Mobile-First UX Principles

The app should be designed primarily for phone usage.

Important principles:

1. One primary action per screen.
2. Default flow should require minimal clicks.
3. Smart Practice should be the default mode.
4. Five questions should be the default session size.
5. Buttons should be large and thumb-friendly.
6. Avoid dense settings screens.
7. Use progressive disclosure for advanced options.
8. Explanation modal should teach, but not slow the user down too much.
9. After results, the primary CTA should be `Practice 5 more`.
10. The app should feel useful during a 1-3 minute break.

---

## 16. Future Upgrade Path

The app should be implemented in a way that can later support:

- Multiple quiz JSON files
- Custom user-created quizzes
- 300+ questions per quiz
- AI-generated questions
- AI-generated explanations
- AI-generated quiz types
- Database-backed storage
- User accounts
- Cross-device progress sync
- Admin quiz editor
- MCP access to quiz database

Potential future stack additions:

```txt
Database: Supabase, Neon, or Vercel Postgres
ORM: Drizzle ORM
Auth: Clerk, Auth.js, or Supabase Auth
AI: Vercel AI SDK
Validation: Zod
MCP: Custom MCP server connected to quiz database
```

The MVP should not implement these features yet, but the code should avoid blocking them.

---

## 17. Out of Scope for MVP

Do not implement yet:

- User accounts
- Backend database
- Cross-device sync
- Admin quiz editor
- Payments
- AI-generated questions
- MCP integration
- Leaderboards
- Certificates
- Complex spaced repetition system
- Theming system (per-quiz visual themes)
- In-progress session persistence (if user navigates away, session is lost)
- Accessibility beyond standard semantic HTML

The MVP should remain simple.

---

## 18. Key Design Principle

The app should not feel like a settings-heavy quiz platform.

It should feel like this:

```txt
I have 2 minutes.
Open app.
Answer 5 useful questions.
Learn from explanations.
Continue my day.
```
