import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Neon from "alchemy/Neon";
import * as Output from "alchemy/Output";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import "varlock/auto-load";
import { deploymentConfig } from "./src/deployment";

const deployment = Effect.gen(function* () {
  const { dev } = yield* Alchemy.AlchemyContext;
  const stage = yield* Alchemy.Stage;
  const revision = dev ? undefined : yield* Config.NonEmptyString("GIT_SHA");
  return yield* Effect.try(() => deploymentConfig(stage, dev, revision));
});

// Cloud stages provision their own Neon project (migrations applied on deploy) and auth secret, so
// the database URL and secret never pass through a developer's machine. Local development reads
// them from the environment.
const database = Effect.gen(function* () {
  const { managed } = yield* deployment;
  if (!managed) return yield* Config.Redacted("DATABASE_URL");
  const project = yield* Neon.Project("database", {
    region: "aws-eu-central-1",
    migrations: "../db/migrations",
  });
  return Output.map(project.pooledConnectionUri, Redacted.make);
});

const authSecret = Effect.gen(function* () {
  const { managed } = yield* deployment;
  return managed
    ? yield* Alchemy.makeRandom("better-auth-secret")
    : yield* Config.Redacted("BETTER_AUTH_SECRET");
});

export const web = Cloudflare.Website.Vite("web", {
  rootDir: "../../apps/web",
  domain: Effect.map(deployment, ({ domain }) => domain),
  workersDev: Effect.map(deployment, ({ workersDev }) => workersDev),
  compatibility: {
    date: "2026-10-09",
    flags: ["nodejs_compat"],
  },
  env: {
    DATABASE_URL: database,
    BETTER_AUTH_SECRET: authSecret,
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
    providers: Layer.mergeAll(Cloudflare.providers(), Neon.providers()),
    state: Alchemy.localState(),
  },
  Effect.gen(function* () {
    const webWorker = yield* web;

    return {
      web: webWorker.url,
    };
  }),
);
