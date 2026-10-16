import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/server/shared/auth/schema.ts", "./src/server/modules/*/persistence/*Table.ts"],
  out: "./migrations",
});
