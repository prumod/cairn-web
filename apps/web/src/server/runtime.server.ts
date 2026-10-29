import { createAuth, getDb } from "../services.js";
import { ENV } from "../env.server.js";
import { readConfig } from "./config.server.js";

export async function getRuntime() {
  const config = readConfig(ENV);
  const db = getDb();

  return { config, db, auth: await createAuth(db) };
}
