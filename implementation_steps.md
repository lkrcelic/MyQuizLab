# MyQuizLab — MVP Implementation Steps

This document breaks the MVP into ordered implementation steps. Each step is self-contained and results in testable, working code. Follow them sequentially.

---

## Phase 1: Project Setup & Foundation

### Step 1: Initialize Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir=false --import-alias="@/*"
```

- Confirm App Router is used (`app/` directory).
- Confirm TypeScript and Tailwind CSS are configured.
- Remove boilerplate (default page content, unnecessary CSS).

**Verify:** `npm run dev` starts without errors, blank page renders at `localhost:3000`.

---

### Step 2: Define Types

Create `types/quiz.ts` and `types/progress.ts`.

**`types/quiz.ts`** — Define all quiz-related types:

- `QuestionType` — union: `"what_does_it_do" | "pick_correct" | "detail_meaning" | "type_answer"`
- `Difficulty` — union: `"beginner" | "intermediate" | "advanced"`
- `Option` — `{ id, label, isCorrect, explanation? }`
- `Question` — `{ id, type, category, difficulty, prompt, options?, answer, acceptedAnswers?, example?, explanation, tags? }`
- `Quiz` — `{ id, title, description, categories, questions }`

**`types/progress.ts`** — Define progress types:

- `QuestionStats` — `{ attempts, correct, incorrect, lastResult, currentCorrectStreak, currentIncorrectStreak, lastAnsweredAt }`
- `QuizProgress` — `{ questionStats: Record<string, QuestionStats> }`
- `ProgressStore` — `{ quizzes: Record<string, QuizProgress> }`

**Verify:** No TypeScript errors. Types import cleanly.

---

### Step 3: Create Zod Quiz Schema

Create `lib/quiz-schema.ts`.

- Define Zod schemas matching the types from Step 2.
- Export a `parseQuiz(data: unknown): Quiz` function that validates and returns typed data or throws.
- Export `quizSchema` for reuse.

**Verify:** Write a quick test or script that validates a sample JSON object against the schema.

---

### Step 4: Create Sample Quiz JSON

Create `content/quizzes/sample-quiz.json`.

- Include 10–15 questions covering at least 3 categories.
- Mix question types: at least 2 `detail_meaning`, 2 `pick_correct`, 2 `what_does_it_do`, 2 `type_answer`.
- Ensure each question has: `id`, `type`, `category`, `difficulty`, `prompt`, `answer`, `explanation`.
- Include `example` and `tags` on most questions.
- For MC questions, include 4 options with `explanation` on the correct one.

**Verify:** The JSON passes Zod validation from Step 3.

---

### Step 5: Build Quiz Loading Utility

Create `lib/quizzes.ts`.

- Export `getAllQuizzes(): Quiz[]` — reads all `.json` files from `content/quizzes/`, validates with Zod, returns array.
- Export `getQuizById(id: string): Quiz | null` — returns a single quiz by ID.
- Export `getQuizIndex(): { id, title, description }[]` — lightweight list for homepage/selection.
- Handle validation errors gracefully (log warning, skip invalid files).

**Verify:** Import and call `getAllQuizzes()` — returns the sample quiz with correct types.

---

### Step 6: Build Progress Store

Create `lib/progress-store.ts`.

- Export `getProgress(quizId: string): QuizProgress` — reads from localStorage.
- Export `getQuestionStats(quizId: string, questionId: string): QuestionStats | undefined`.
- Export `recordAnswer(quizId: string, questionId: string, isCorrect: boolean): void` — updates stats per the spec (increments attempts, correct/incorrect, streaks, timestamp).
- Export `isLocalStorageAvailable(): boolean` — returns false in private browsing or when quota is exceeded.
- All localStorage logic stays in this file only — never in components.

**Verify:** Manually call `recordAnswer` and confirm localStorage is updated correctly. Verify `getQuestionStats` returns updated data.

---

## Phase 2: Smart Practice & Scoring Logic

### Step 7: Build Smart Practice Selection

Create `lib/smart-practice.ts`.

- Export `selectSmartPracticeQuestions(questions: Question[], progress: QuizProgress, count: number): Question[]`.
- Implement priority score formula from spec (section 11.2).
- Implement bucket distribution: ~40% unseen, ~40% weak, ~20% review for a 5-question session.
- If a bucket is underfilled, fill from next best.
- Mastered questions are deprioritized but never excluded.
- Light shuffle at the end.

**Verify:** Given a set of questions and mock progress data, the function returns the expected mix of unseen/weak/review questions.

---

### Step 8: Build Scoring & Answer Checking

Create `lib/scoring.ts` and `lib/answer-normalization.ts`.

**`lib/scoring.ts`:**

- Export `checkAnswer(question: Question, userAnswer: string): boolean`.
- For MC types: compare `userAnswer` to `question.answer` (option ID).
- For `type_answer`: normalize and compare against `question.answer` + `question.acceptedAnswers`.

**`lib/answer-normalization.ts`:**

- Export `normalizeAnswer(input: string): string` — trim, collapse spaces, lowercase.
- Export `answersMatch(userAnswer: string, correctAnswer: string): boolean`.

**`lib/shuffle.ts`:**

- Export `shuffleArray<T>(arr: T[]): T[]` — Fisher-Yates shuffle.

**Verify:** Unit test `checkAnswer` with various inputs (exact match, normalized match, wrong answer).

---

### Step 9: Build Mastery Helper

Add to `lib/smart-practice.ts` or create `lib/mastery.ts`:

- Export `isMastered(stats: QuestionStats): boolean` — returns true when `correct >= 3 && currentCorrectStreak >= 3 && accuracy >= 0.8`.
- Export `getStatusLabel(stats?: QuestionStats): "Unseen" | "Needs practice" | "Recently missed" | "Learning" | "Mastered"`.

**Verify:** Test with various stat combinations.

---

## Phase 3: Quiz UI

### Step 10: Build QuizShell Layout Component

Create `components/QuizShell.tsx`.

- Mobile-first container with proper viewport padding.
- Slot for header (progress indicator) and main content.
- Consistent max-width for readability on larger screens.

**Verify:** Renders a centered container on mobile and desktop.

---

### Step 11: Build Homepage

Implement `app/page.tsx`.

- App title + short intro text.
- Primary CTA button: "Start Smart Practice" — links to `/quiz/<quizId>`.
- Secondary "Custom session" link — toggles an inline panel with:
  - Mode selector (radio/buttons, Smart Practice default).
  - Question count selector (5, 10, 20, All).
  - Start button.
- Link to review page (`/review/<quizId>`).
- If only one quiz exists, auto-select it (use `getQuizIndex()`).

**Verify:** Page renders. CTA links to quiz page. Custom session panel toggles correctly.

---

### Step 12: Build Quiz Engine (Core Session Logic)

Implement `app/quiz/[quizSlug]/page.tsx` as a client component.

State to manage:

- `questions: Question[]` — selected questions for this session.
- `currentIndex: number` — which question is active.
- `answers: Record<string, { userAnswer: string; isCorrect: boolean }>` — session answers.
- `sessionPhase: "answering" | "explanation" | "results"` — current phase.

On mount:

1. Load quiz by slug using `getQuizById()`.
2. Load progress from `progress-store`.
3. Select questions via Smart Practice (or mode-filtered) using `selectSmartPracticeQuestions()`.
4. Set `sessionPhase = "answering"`.

Flow:

1. Show `QuestionCard` → user answers → check answer → `recordAnswer()` → show `ExplanationModal`.
2. User taps Continue → advance to next question or show results.

**Verify:** Full session flow works: answer 5 questions, see explanation after each, reach results.

---

### Step 13: Build QuestionCard Component

Create `components/QuestionCard.tsx`.

- Shows progress indicator (e.g., "2 / 5").
- Shows question prompt.
- Renders `AnswerOptions` for MC questions or `TypeAnswerInput` for `type_answer` questions.
- Submit button (large, thumb-friendly, sticky bottom on mobile).

**Verify:** Renders correctly for both MC and typed questions.

---

### Step 14: Build AnswerOptions Component

Create `components/AnswerOptions.tsx`.

- Renders option buttons for MC questions.
- Large tap targets, clear labels.
- Highlights selected option.
- Disables after submission.
- Shows correct/incorrect visual feedback after submission.

**Verify:** Selecting an option highlights it. After submit, correct answer is shown green, wrong red.

---

### Step 15: Build TypeAnswerInput Component

Create `components/TypeAnswerInput.tsx`.

- Text input field for typed answers.
- Submit button.
- After submission, shows correct answer if wrong.

**Verify:** Typing + submitting works. Normalization is applied before checking.

---

### Step 16: Build ExplanationModal Component

Create `components/ExplanationModal.tsx`.

- Near-full-screen modal/drawer on mobile.
- Shows:
  - Correct/incorrect badge.
  - User's answer.
  - Correct answer.
  - Explanation text (only for correct answer).
  - Example if available.
  - Category + difficulty.
  - "Ask more on ChatGPT" button (see Step 17).
  - "Continue" primary CTA button at bottom.
- Scrollable content, sticky Continue button.

**Verify:** Modal opens after answering. Content is correct. Continue advances to next question.

---

### Step 17: Build ChatGPT Helper

Create `lib/chatgpt-prompt.ts`.

- Export `buildChatGPTUrl(question: Question): string`.
- Resolves correct answer: for MC, looks up option label by `answer` ID.
- Builds prompt string:
  ```
  Explain this in simple terms:

  Question: <prompt>
  Correct answer: <resolved label>

  Please explain:
  1. What it does and why it's useful
  2. A practical example with expected output
  3. Common mistakes or gotchas
  4. One small practice exercise I can try
  ```
- URL-encodes the prompt.
- Returns `https://chatgpt.com/?temporary-chat=true&q=<encoded>`.

Wire into `ExplanationModal`: the "Ask more on ChatGPT" button opens this URL in a new tab.

**Verify:** Clicking the button opens ChatGPT with a pre-filled prompt about the correct answer.

---

### Step 18: Build QuizResults Component

Create `components/QuizResults.tsx`.

- Shows: score, correct/incorrect count, new/weak/improved stats.
- Primary CTA: "Practice 5 more" — restarts a new Smart Practice session.
- Secondary CTA: "Retry missed" — starts a session with only missed questions.
- Link to review page.

**Verify:** Results render after completing a session. CTAs work correctly.

---

## Phase 4: Review Page

### Step 19: Build Review Page

Implement `app/review/[quizSlug]/page.tsx`.

- Load quiz + progress.
- Show all questions as compact cards.
- Each card: title/prompt, short description, status badge, category, expand/collapse.
- Implement filters: All, Unseen, Needs practice, Mastered, Recently missed, Category.

Create `components/ReviewCard.tsx` for individual cards.

**Verify:** Page renders all questions. Filters work. Status badges reflect localStorage progress.

---

## Phase 5: PWA & Polish

### Step 20: Add PWA Manifest

Create `app/manifest.ts` (Next.js metadata export).

- Name: "MyQuizLab"
- Short name: "QuizLab"
- Display: standalone
- Theme color, background color.
- Icons: create placeholder 192x192 and 512x512 PNGs in `public/icons/`.

**Verify:** Lighthouse PWA check passes installability. App can be installed on mobile.

---

### Step 21: Mobile UX Polish

- Ensure all tap targets are ≥ 44x44px.
- Test on mobile viewport (375px width).
- Ensure explanation modal is scrollable and doesn't overflow.
- Ensure sticky buttons don't overlap content.
- Add appropriate viewport meta tag.
- Test the full flow: homepage → quiz → explanation → results → retry.

**Verify:** Complete a full session on a mobile-sized viewport without layout issues.

---

### Step 22: Error States

Implement the error/empty states from spec section 11.4:

- Quiz fails to load → show error message.
- No questions for selected mode → show message + offer Smart Practice.
- localStorage unavailable → subtle warning banner, app still works.

**Verify:** Simulate each error condition and confirm graceful handling.

---

## Phase 6: Testing & Deployment

### Step 23: Add Core Tests

Write tests for:

- `lib/quiz-schema.ts` — valid and invalid quiz JSON.
- `lib/scoring.ts` — answer checking for all question types.
- `lib/answer-normalization.ts` — trimming, collapsing, case-insensitive matching.
- `lib/smart-practice.ts` — question selection distribution, priority scoring, mastery check.
- `lib/progress-store.ts` — recording answers, reading stats.
- `lib/chatgpt-prompt.ts` — URL generation with correct encoding.

Use Vitest or Jest (whichever Next.js template includes).

**Verify:** All tests pass. `npm test` exits cleanly.

---

### Step 24: Deploy to Vercel

- Push to GitHub.
- Connect repo to Vercel.
- Deploy.
- Test the deployed app on a real mobile device.

**Verify:** App loads on production URL. Full quiz flow works. PWA installable.

---

## Summary: File Creation Order

| # | File(s) | Purpose |
|---|---------|---------|
| 1 | Project init | Next.js + TS + Tailwind |
| 2 | `types/quiz.ts`, `types/progress.ts` | Type definitions |
| 3 | `lib/quiz-schema.ts` | Zod validation |
| 4 | `content/quizzes/sample-quiz.json` | Sample quiz data |
| 5 | `lib/quizzes.ts` | Quiz loading/discovery |
| 6 | `lib/progress-store.ts` | localStorage abstraction |
| 7 | `lib/smart-practice.ts` | Question selection algorithm |
| 8 | `lib/scoring.ts`, `lib/answer-normalization.ts`, `lib/shuffle.ts` | Answer checking |
| 9 | (added to smart-practice or mastery) | Mastery helpers |
| 10 | `components/QuizShell.tsx` | Layout shell |
| 11 | `app/page.tsx` | Homepage |
| 12 | `app/quiz/[quizSlug]/page.tsx` | Quiz session engine |
| 13 | `components/QuestionCard.tsx` | Question display |
| 14 | `components/AnswerOptions.tsx` | MC answer buttons |
| 15 | `components/TypeAnswerInput.tsx` | Typed answer input |
| 16 | `components/ExplanationModal.tsx` | Post-answer modal |
| 17 | `lib/chatgpt-prompt.ts` | ChatGPT URL builder |
| 18 | `components/QuizResults.tsx` | Results screen |
| 19 | `app/review/[quizSlug]/page.tsx`, `components/ReviewCard.tsx` | Review page |
| 20 | `app/manifest.ts`, `public/icons/*` | PWA setup |
| 21–22 | (polish & error handling) | UX refinement |
| 23 | `__tests__/*` or `*.test.ts` | Core logic tests |
| 24 | Vercel deployment | Production |
