import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { URL, fileURLToPath } from "node:url";

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(name + " is required for the local acceptance Worker.");
  return value;
}

// Test only: serve the compiled application in workerd, not a Node server or Vite dev server.
export default Alchemy.Stack(
  "CairnAcceptance",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const worker = yield* Cloudflare.Worker("app", {
      main: fileURLToPath(new URL("../../../apps/web/dist/server/server.js", import.meta.url)),
      assets: {
        directory: fileURLToPath(new URL("../../../apps/web/dist/client", import.meta.url)),
      },
      compatibility: { date: "2026-10-09", flags: ["nodejs_compat"] },
      dev: { port: Number(required("PORT")) },
      env: {
        DATABASE_URL: required("DATABASE_URL"),
        BETTER_AUTH_URL: required("APP_ORIGIN"),
        APP_ORIGIN: required("APP_ORIGIN"),
        BETTER_AUTH_SECRET: required("BETTER_AUTH_SECRET"),
        GOOGLE_CLIENT_ID: required("GOOGLE_CLIENT_ID"),
        GOOGLE_CLIENT_SECRET: required("GOOGLE_CLIENT_SECRET"),
        BOOTSTRAP_ADMIN_EMAIL: required("BOOTSTRAP_ADMIN_EMAIL"),
        APP_ENV: "test",
      },
    });
    return { app: worker.url };
  }),
);
