// Database module is present for compatibility but is NOT USED by this app.
// ToolBox Pro is 100% client-side. All file processing, conversion, compression,
// QR codes, password generation, etc. happen in the browser.
// 
// No DATABASE_URL is required. This file is kept only so the project structure
// remains compatible if you ever want to add a database later.

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

let pool: Pool | null = null;
let db: any = null;

if (databaseUrl) {
  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  pool =
    globalForDb.__arenaNextJsPostgresqlPool ??
    new Pool({
      connectionString: databaseUrl,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
  }

  db = drizzle(pool);
} else {
  // Safe no-op exports when no database is configured
  pool = null;
  db = null;
}

export { pool, db };