import { sql } from "drizzle-orm";
import { sqliteTable, integer, text, real, check } from "drizzle-orm/sqlite-core";
export const companyProfileTable = sqliteTable(
  "company_profile",
  {
    id: integer("id").primaryKey().default(1),
    name: text("name", { length: 200 }).notNull(),
    address: text("address", { length: 500 }).notNull(),
    radiusKm: real("radius_km").notNull(),
  },
  (t) => [
    check("one_company_profile", sql`${t.id} = 1`),
    check(
      "positive_finite_radius",
      sql`${t.radiusKm} > 0 AND ${t.radiusKm} <= 1.7976931348623157e308`,
    ),
  ],
);
