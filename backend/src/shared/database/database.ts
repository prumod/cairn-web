import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";

export function createDatabase(url: string) {
  const pool = new pg.Pool({ connectionString: url });
  return { pool, db: drizzle(pool) };
}
export type Database = ReturnType<typeof createDatabase>["db"];

export function migrateDatabase(db: Database) {
  return migrate(db, {
    migrationsFolder: fileURLToPath(new URL("../../../migrations", import.meta.url)),
  });
}
