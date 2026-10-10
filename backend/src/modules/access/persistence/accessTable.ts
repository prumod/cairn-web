import { pgTable, text, boolean } from "drizzle-orm/pg-core";
import { user } from "../../../shared/auth/schema.js";

export const accessTable = pgTable("user_access", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  administrator: boolean("administrator").notNull().default(false),
  approved: boolean("approved").notNull().default(false),
});
