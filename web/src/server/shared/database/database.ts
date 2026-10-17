import { drizzle } from "drizzle-orm/d1";
export function createDatabase(binding: Parameters<typeof drizzle>[0]) {
  return { db: drizzle(binding) };
}
export type Database = ReturnType<typeof createDatabase>["db"];
