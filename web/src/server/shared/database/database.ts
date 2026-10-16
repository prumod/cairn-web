import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

export function createDatabase(url: string) {
  const pool = new pg.Pool({ connectionString: url });
  return { pool, db: drizzle(pool) };
}
export type Database = ReturnType<typeof createDatabase>["db"];

export function migrateDatabase(db: Database, migrationsFolder: string) {
  return migrate(db, { migrationsFolder });
}
