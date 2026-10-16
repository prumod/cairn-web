import { resolve } from "node:path";
import { createDatabase, migrateDatabase } from "./shared/database/database.js";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const { db, pool } = createDatabase(url);
try {
  await migrateDatabase(db, resolve(process.cwd(), "migrations"));
} finally {
  await pool.end();
}
