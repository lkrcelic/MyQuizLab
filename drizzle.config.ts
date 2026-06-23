import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

config({ path: ".env.local" });

// Empty fallback lets `drizzle-kit generate` (schema-only, no connection) run
// before a DB is provisioned. `migrate`/`push`/`studio` will fail clearly if unset.
const connectionString =
  process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: connectionString,
  },
});
