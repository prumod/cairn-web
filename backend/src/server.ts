import { fileURLToPath } from "node:url";
import { createApplication } from "./app.js";
import { readConfig } from "./config.js";
import { createAuth } from "./shared/auth/auth.js";
import { createDatabase, migrateDatabase } from "./shared/database/database.js";

const config = readConfig();
const { db, pool } = createDatabase(config.databaseURL);
try {
  await migrateDatabase(db);
} catch (error) {
  await pool.end();
  throw error;
}
const auth = createAuth(db, config);
const app = createApplication({
  db,
  auth,
  origin: config.origin,
  bootstrapEmail: config.bootstrapEmail,
  revision: config.revision,
  staticDirectory: fileURLToPath(new URL("../../web/dist", import.meta.url)),
});
const server = app.listen(config.port, "0.0.0.0", () => {
  console.log("Cairn listening on port " + config.port);
});
function close() {
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}
process.once("SIGTERM", close);
process.once("SIGINT", close);
