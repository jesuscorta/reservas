import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb(connectionString: string) {
  const client = postgres(connectionString, {
    prepare: false,
    max: 2,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

export type Database = ReturnType<typeof createDb>;
const globalForDb = globalThis as typeof globalThis & { reservasDb?: Database; reservasDbUrl?: string };

export function getDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is required to access the database.");
  // Keep a small pool alive in warm dev/Vercel instances instead of reconnecting per query.
  if (!globalForDb.reservasDb || globalForDb.reservasDbUrl !== connectionString) {
    globalForDb.reservasDb = createDb(connectionString);
    globalForDb.reservasDbUrl = connectionString;
  }
  return globalForDb.reservasDb;
}
