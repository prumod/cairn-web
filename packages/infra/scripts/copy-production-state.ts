// One-off: copy the production stage's local state into the Cloudflare state store.
//
// Run it from the checkout that owns the local state, so the local store resolves to that
// checkout's `.alchemy` directory:
//   cd <owner checkout>/packages/infra && ALCHEMY_PROFILE=<profile> bun <this file> [--apply]
//
// Without `--apply` it only lists the records it would copy. It never touches the testing stage.
import { AlchemyContextLive } from "alchemy/AlchemyContext";
import { ArtifactStore, createArtifactStore } from "alchemy/Artifacts";
import * as AlchemistState from "alchemy/Alchemist/routes/state";
import { CredentialsStoreLive } from "alchemy/Auth/Credentials";
import { ProfileStoreLive } from "alchemy/Auth/Profile";
import * as CliKit from "alchemy/Cli/CliKit/index";
import { PlatformServices, runMain } from "alchemy/Util/PlatformServices";
import * as Effect from "effect/Effect";
import * as FetchHttpClient from "effect/http/FetchHttpClient";
import * as Layer from "effect/Layer";

const stack = "cairn";
const stage = "production";
const apply = process.argv.includes("--apply");
const profile = process.env.ALCHEMY_PROFILE ?? "default";

const copyProduction = Effect.gen(function* () {
  const source = yield* AlchemistState.store({ backend: "local" });
  const destination = yield* AlchemistState.store({ backend: "cloudflare", profile });
  const fqns = (yield* source.list({ stack, stage })).toSorted();
  const existing = yield* destination.list({ stack, stage });

  if (existing.length > 0) {
    return yield* Effect.fail(
      new Error(`The Cloudflare store already has ${existing.length} ${stage} records. Stop.`),
    );
  }

  console.log(
    `${apply ? "Copying" : "Would copy"} ${fqns.length} ${stage} records: ${fqns.join(", ")}`,
  );

  if (!apply) return;

  for (const fqn of fqns) {
    const value = yield* source.get({ stack, stage, fqn });

    if (value === undefined) {
      return yield* Effect.fail(new Error(`The local store has no record for ${fqn}.`));
    }

    yield* destination.set({ stack, stage, fqn, value });
  }

  const output = yield* source.getOutput({ stack, stage });

  if (output !== undefined) yield* destination.setOutput({ stack, stage, value: output });

  const copied = (yield* destination.list({ stack, stage })).toSorted();

  if (copied.join("\n") !== fqns.join("\n")) {
    return yield* Effect.fail(new Error("The copied record names differ from the local ones."));
  }

  for (const fqn of fqns) {
    const [local, remote] = yield* Effect.all([
      source.get({ stack, stage, fqn }),
      destination.get({ stack, stage, fqn }),
    ]);

    if (JSON.stringify(local) !== JSON.stringify(remote)) {
      return yield* Effect.fail(new Error(`The copied record ${fqn} differs from the local one.`));
    }
  }

  console.log(`Copied and verified ${fqns.length} ${stage} records.`);
});

const services = Layer.mergeAll(
  AlchemyContextLive,
  CredentialsStoreLive,
  ProfileStoreLive,
  Layer.succeed(ArtifactStore, createArtifactStore()),
  Layer.provide(CliKit.CliKitInteraction, CliKit.layer()),
).pipe(Layer.provideMerge(PlatformServices), Layer.provideMerge(FetchHttpClient.layer));

runMain(copyProduction.pipe(Effect.provide(services), Effect.scoped));
