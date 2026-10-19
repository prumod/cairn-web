import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

export function createDb(env: DatabaseConfig) {
  // The disposable local Neon proxy terminates HTTP on a loopback port.
  // All hosted databases retain the driver’s HTTPS endpoint.
  neonConfig.fetchEndpoint = (host, port) =>
    host === "db.localtest.me" ? `http://127.0.0.1:${port}/sql` : `https://${host}/sql`;
  const sql = neon(env.DATABASE_URL);
  return drizzle({ client: sql, relations });
}

export type Database = ReturnType<typeof createDb>;
