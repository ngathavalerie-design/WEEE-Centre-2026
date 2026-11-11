import { Pool } from "pg";

/**
 * One shared PostgreSQL connection pool per server instance.
 *
 * DATABASE_URL examples:
 *   Railway (same project):  postgresql://postgres:pass@postgres.railway.internal:5432/railway
 *   Neon / Supabase (Vercel): postgresql://user:pass@host/db?sslmode=require
 *
 * Keep PG_POOL_MAX small (3–5) on serverless hosts like Vercel, where many
 * instances can each open their own pool. On Railway (one long-running server) 10 is fine.
 */
const globalForPg = globalThis as unknown as { weeePgPool?: Pool };

export const pool: Pool =
  globalForPg.weeePgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX ?? 5),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

// Reuse the pool across hot reloads in development.
if (process.env.NODE_ENV !== "production") globalForPg.weeePgPool = pool;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
