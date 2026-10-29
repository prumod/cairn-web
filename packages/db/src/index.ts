import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import type { DatabaseConfig } from "./config";
import { relations } from "./relations";

const originalFetchEndpoint = neonConfig.fetchEndpoint;

// Only the disposable local Neon proxy terminates HTTP on loopback.
// Delegate hosted routing (including authenticated requests) to the driver.
neonConfig.fetchEndpoint = (host, port, options) => {
  if (host === "db.localtest.me") return `http://127.0.0.1:${port}/sql`;

  return originalFetchEndpoint instanceof Function
    ? originalFetchEndpoint(host, port, options)
    : originalFetchEndpoint;
};

export function createDb(env: DatabaseConfig) {
  const sql = neon(env.DATABASE_URL);

  return drizzle({ client: sql, relations });
}

export type Database = ReturnType<typeof createDb>;
