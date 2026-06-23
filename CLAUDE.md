# MyQuizLab

A Next.js (App Router) quiz app. Users take quizzes, get explanations, and the
owner curates the question pool by rating questions. Deployed on Vercel with a
Neon Postgres database.

## Stack

- **Next.js 15** (App Router, React 19, server components)
- **Tailwind CSS**
- **Drizzle ORM** + **Neon serverless Postgres** (`@neondatabase/serverless`)
- **Zod** for validation
- **Vitest** for tests

## Data model

Questions and quizzes live in **Postgres** (source of truth). Two tables, defined
in [lib/db/schema.ts](lib/db/schema.ts):

- `quizzes` — `id` (slug), `title`, `description`, `categories` (jsonb)
- `questions` — content columns + `rating` (`'great' | 'deleted' | null`) and
  `ratedAt`. Sub-structures (`options`, `acceptedAnswers`, `tags`) are jsonb so
  they round-trip to the TypeScript types in [types/quiz.ts](types/quiz.ts).

The JSON files in `content/quizzes/*.json` are **seed/bootstrap input only**, not
the source of truth (see "Adding/editing questions").

### Reading questions
[lib/quizzes.ts](lib/quizzes.ts) — `getAllQuizzes`, `getQuizById`, `getQuizIndex`
(all async Drizzle queries). Questions with `rating = 'deleted'` are filtered out
(soft hide). The server pages ([app/page.tsx](app/page.tsx),
[app/quiz/[quizSlug]/page.tsx](app/quiz/[quizSlug]/page.tsx),
[app/review/[quizSlug]/page.tsx](app/review/[quizSlug]/page.tsx)) are
`export const dynamic = "force-dynamic"` so curation shows live without a rebuild.

### DB client
[lib/db/index.ts](lib/db/index.ts) — lazy Drizzle client. Importing it never
connects; the connection string (`DATABASE_URL`, falling back to `POSTGRES_URL`)
is only required when a query actually runs.

## Question rating

- UI: buttons below the "Ask more on ChatGPT" link in
  [components/ExplanationModal.tsx](components/ExplanationModal.tsx)
  (👍 Great question / 🗑 Delete question). Optimistic, reflect current state.
- Client helper: [lib/ratings-client.ts](lib/ratings-client.ts).
- API: [app/api/ratings/route.ts](app/api/ratings/route.ts) —
  `POST { questionId, rating }`. **No auth** (anyone can rate; soft-delete is
  recoverable). Gate behind an `ADMIN_TOKEN` env var later if needed.

"Delete" is a **soft hide** (`rating = 'deleted'`), reversible by re-clicking or
clearing the rating in the DB.

## Adding / editing questions

The DB is the source of truth; seeding is **append-only**
([scripts/seed.ts](scripts/seed.ts) uses `onConflictDoNothing`):

- **New question** → add it to a `content/quizzes/*.json` file; the next deploy
  (or `npm run seed`) inserts it. Or insert directly into the DB.
- **Edit an existing question** → change it **in the DB** (`npm run db:studio` or
  the Neon console). Editing the JSON will NOT overwrite an existing DB row.
- **Remove a question** → soft-delete via the 🗑 button (recommended), or delete
  the row in the DB.

## Commands

```
npm run dev          # local dev server
npm test             # vitest (pure-logic tests: scoring, smart-practice, schema…)
npm run build        # next build only (no DB needed)

npm run db:generate  # generate SQL migration from schema changes -> drizzle/
npm run db:migrate   # apply migrations to the DB
npm run db:push      # push schema directly (dev convenience)
npm run db:studio    # Drizzle Studio GUI to view/edit rows
npm run seed         # append-only seed from content/quizzes/*.json
```

## Deployment (Vercel)

Vercel runs the `vercel-build` script instead of the default build:

```
"vercel-build": "drizzle-kit migrate && tsx scripts/seed.ts && next build"
```

Every deploy: **apply migrations → insert any new questions → build**. Requires
`DATABASE_URL` (or `POSTGRES_URL`) set in the Vercel project env. Keep the Vercel
"Build Command" on default/empty so `vercel-build` is used.

Schema changes workflow: edit [lib/db/schema.ts](lib/db/schema.ts) →
`npm run db:generate` → commit the new `drizzle/*.sql` → deploy applies it.

## Other notes

- User progress/stats are stored in the browser's `localStorage`
  ([lib/progress-store.ts](lib/progress-store.ts)), not the DB.
- Question selection logic lives in [lib/smart-practice.ts](lib/smart-practice.ts)
  (shuffles before scoring so ties aren't always picked in file order).
- `.env.local` holds `DATABASE_URL` locally and is gitignored.
