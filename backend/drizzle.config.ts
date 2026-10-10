import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: ["./src/shared/auth/schema.ts", "./src/modules/*/persistence/*Table.ts"],
  out: "./migrations",
});
