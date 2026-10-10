import { sql } from "drizzle-orm";
import { pgTable, integer, varchar, doublePrecision, check } from "drizzle-orm/pg-core";

export const companyProfileTable = pgTable(
  "company_profile",
  {
    id: integer("id").primaryKey().default(1),
    name: varchar("name", { length: 200 }).notNull(),
    address: varchar("address", { length: 500 }).notNull(),
    radiusKm: doublePrecision("radius_km").notNull(),
  },
  (t) => [
    check("one_company_profile", sql`${t.id} = 1`),
    check("positive_finite_radius", sql`${t.radiusKm} > 0 AND ${t.radiusKm} < 'Infinity'::float8`),
  ],
);
