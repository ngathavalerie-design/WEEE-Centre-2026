// Applies db/schema.sql to the database in DATABASE_URL.
// Local:       npm run db:migrate        (reads .env.local)
// Production:  npm run db:migrate:prod   (uses the platform's environment variables)
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const sql = await readFile(path.join(here, "..", "db", "schema.sql"), "utf8");

const client = new pg.Client({ connectionString: url });
try {
  await client.connect();
  await client.query(sql);
  console.log("✔ Database schema is up to date.");
} catch (err) {
  console.error("✖ Migration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
