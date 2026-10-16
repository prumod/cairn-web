import { resolve } from "node:path";
import type pg from "pg";
import type { createAuth } from "./shared/auth/auth.js";
import { createAuth as makeAuth } from "./shared/auth/auth.js";
import { createDatabase, migrateDatabase } from "./shared/database/database.js";
import type { readConfig } from "./config.server.js";
import { readConfig as loadConfig } from "./config.server.js";

export type RuntimeConfig = ReturnType<typeof readConfig>;
type Runtime = {
  auth: ReturnType<typeof createAuth>;
  config: RuntimeConfig;
  db: ReturnType<typeof createDatabase>["db"];
  pool: pg.Pool;
};

let runtime: Promise<Runtime> | undefined;

async function initialize(): Promise<Runtime> {
  let stage = "configuration";
  let pool: pg.Pool | undefined;
  try {
    const config = loadConfig();
    stage = "database connection";
    const database = createDatabase(config.databaseURL);
    pool = database.pool;
    stage = "database migrations";
    await migrateDatabase(database.db, resolve(process.cwd(), "migrations"));
    stage = "authentication";
    return {
      auth: makeAuth(database.db, config),
      config,
      db: database.db,
      pool,
    };
  } catch (error) {
    console.error(`Runtime initialization failed during ${stage}.`);
    await pool?.end();
    throw error;
  }
}

export function getRuntime() {
  runtime ??= initialize().catch((error: unknown) => {
    runtime = undefined;
    throw error;
  });
  return runtime;
}

export async function closeRuntimeForTests() {
  const current = runtime;
  runtime = undefined;
  if (current) await (await current).pool.end();
}
