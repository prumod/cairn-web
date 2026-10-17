// Throwaway Workers/D1 compatibility prototype; no request-time migrations.
import { env } from "cloudflare:workers";
import { createAuth } from "./shared/auth/auth.js";
import { createDatabase } from "./shared/database/database.js";
import { readConfig } from "./config.server.js";

export type RuntimeConfig = ReturnType<typeof readConfig>;
export async function getRuntime() {
  const config = readConfig();
  const { db } = createDatabase(env.DB);
  return { config, db, auth: createAuth(db, config) };
}
