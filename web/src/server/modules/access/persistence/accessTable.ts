import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { user } from "../../../shared/auth/schema.js";
export const accessTable = sqliteTable("user_access", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  administrator: integer("administrator", { mode: "boolean" }).notNull().default(false),
  approved: integer("approved", { mode: "boolean" }).notNull().default(false),
});
