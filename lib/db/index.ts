import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let instance: Database | null = null;

function getDb(): Database {
  if (instance) return instance;

  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    throw new Error(
      "Missing database connection string. Set DATABASE_URL (or POSTGRES_URL)."
    );
  }

  instance = drizzle(neon(connectionString), { schema });
  return instance;
}

// Lazy proxy: importing this module never connects or throws — the connection
// string is only required when a query actually runs (request time).
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === "function" ? value.bind(real) : value;
  },
});
