import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { sql } from "drizzle-orm";
import { describeDatabaseUrl, getDatabaseUrl } from "./database-url";
import * as schema from "./schema";
import { loadRootEnv } from "./load-env";

const { Pool } = pg;

loadRootEnv();
const connectionString = getDatabaseUrl();

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

export async function assertDatabaseConnection(): Promise<void> {
  await pool.query("select 1");
}

export function getRedactedDatabaseUrl(): string {
  return describeDatabaseUrl(connectionString);
}

export * from "./schema";
