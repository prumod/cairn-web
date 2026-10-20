import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import "varlock/auto-load";
import { deploymentConfig } from "./src/deployment";

const deployment = Effect.gen(function* () {
  const { dev } = yield* Alchemy.AlchemyContext;
  const stage = yield* Alchemy.Stage;
  const revision = dev ? undefined : yield* Config.NonEmptyString("GIT_SHA");
  return yield* Effect.try(() => deploymentConfig(stage, dev, revision));
});

export const web = Cloudflare.Website.Vite("web", {
  rootDir: "../../apps/web",
  domain: Effect.map(deployment, ({ domain }) => domain),
  compatibility: {
    date: "2026-10-09",
    flags: ["nodejs_compat"],
  },
  env: {
    DATABASE_URL: Config.Redacted("DATABASE_URL"),
    BETTER_AUTH_SECRET: Config.Redacted("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: Cloudflare.Worker.URL,
    APP_ORIGIN: Cloudflare.Worker.URL,
    GOOGLE_CLIENT_ID: Config.NonEmptyString("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: Config.Redacted("GOOGLE_CLIENT_SECRET"),
    BOOTSTRAP_ADMIN_EMAIL: Config.NonEmptyString("BOOTSTRAP_ADMIN_EMAIL"),
    APP_ENV: Effect.map(deployment, ({ appEnv }) => appEnv),
    GIT_SHA: Effect.map(deployment, ({ revision }) => revision),
  },
  dev: {
    port: 3001,
  },
});

export type WebEnv = Cloudflare.InferEnv<typeof web>;

export default Alchemy.Stack(
  "cairn",
  {
    providers: Cloudflare.providers(),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const webWorker = yield* web;

    return {
      web: webWorker.url,
    };
  }),
);
