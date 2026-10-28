# Testing

## Test boundaries

Vitest discovers colocated tests under `{apps/web,shared}/src/**/*.{spec,test}.{ts,tsx}` and `packages/*/src/**/*.{spec,test}.{ts,tsx}`. It also discovers acceptance/typical integration tests under `apps/web/tests/{acceptance,typical}/integration/`. Playwright-BDD discovers capability contracts under `features/company/` and `features/access/`, with step bindings under `apps/web/tests/acceptance/e2e/`.

The suite covers local application behavior through the built TanStack Start Worker: routes, database-backed access, company-profile persistence, origin checks, and related authentication handling. Browser identities are controlled fixtures; they do not run Google's OAuth redirect, consent, state, or PKCE flow.

## How local tests run

Both `bun run test:fast` and `bun run test:browser` build the app before executing their tests. Docker Compose is required. `scripts/with-test-postgres.mjs` starts a uniquely named, disposable Compose project from `compose.test.yaml`:

- PostgreSQL 18.6 uses a pinned image digest, a temporary data volume, and a loopback-only dynamic port.
- A pinned local Neon HTTP proxy connects the test app's Neon serverless HTTP driver to that PostgreSQL container.
- The wrapper passes `TEST_DATABASE_URL` and `TEST_NEON_PORT` to the test process, then removes the Compose project and volumes.

Test support creates a uniquely named database for each application fixture, applies `packages/db/migrations/` through the Neon HTTP migrator, and starts the compiled Worker with the test-only Alchemy stack in `packages/infra/test/alchemy.run.ts`. The Worker runs in `workerd`, serves the built client assets, and uses a unique local test stage. Browser acceptance adds an isolated control proxy outside the app for creating controlled Better Auth identities. It is not an application route and is not included in production builds.

The CI workflow uses the same Docker Compose wrapper; it does not declare a separate PostgreSQL service. No manual `pg_ctl` server or persistent local test database is required.

## Commands

Run commands from the repository root with Bun 1.3.14:

- `bun run test:fast` builds the Worker and runs Vitest using the disposable PostgreSQL/Neon proxy pair.
- `bun run test:browser` builds the Worker and runs the Chromium Playwright-BDD scenarios against the local test Worker. Install Chromium with the repository setup command or `bunx --no-install playwright install chromium`.
- `bun run test` runs a fresh build, fast tests, and browser tests.
- `bun run typecheck` first regenerates environment types, then checks workspace packages and root test/config types.
- `bun run check` runs formatting, lint, boundary checks/proofs, typecheck, build, dependency audit, and the fast and browser test suites. The required `Agent checks` CI workflow runs the same full check; the local commit and push gates do not run tests.

## Scoped mutation pilot

Run these commands from the repository root after installing locked dependencies. The scripts use Node for Vitest/Stryker; CI pins Node 22.23.2 and Bun 1.3.14.

```sh
bun run test:mutation
bun run mutation
# Optional subsequent local run using cached results:
bun run mutation:incremental
```

`test:mutation` runs the direct-source baseline in `vitest.mutation.config.ts`. `mutation` runs Stryker 10.1.1 with `stryker.config.mjs` and `@stryker-mutator/vitest-runner` 10.1.1. The selected source/test pairs are:

- `packages/infra/src/deployment.ts` → `packages/infra/src/deployment.test.ts`
- `apps/web/src/server/config.server.ts` → `apps/web/src/server/config.server.spec.ts`
- `apps/web/src/server/shared/observability/observability.ts` → `apps/web/src/server/shared/observability/observability.spec.ts`
- `packages/db/src/index.ts` → `packages/db/src/index.spec.ts`

These Node-environment tests import source directly and need neither a built Worker nor the disposable database. Stryker uses per-test coverage and concurrency 2. Built Worker integration and browser tests run code in a separate process/build; they cannot observe these instrumented source modules and are excluded from this pilot. The pilot does not measure the whole application's test effectiveness. Runner 10.1.1 is intentional: 10.0.0 ran no tests for nested Vitest 5 test names.

Open `reports/mutation/mutation.html` for the HTML report; machine-readable results are in `reports/mutation/mutation.json`. Incremental runs use `reports/mutation/incremental.json`. Reports and `.stryker-tmp/` are ignored. Incremental results reuse prior work: run a fresh `bun run mutation` when assessing a candidate revision, especially after changing configuration, dependencies, or the test environment.

`.github/workflows/mutation.yml` runs on pull requests, pushes to `main`, and manual dispatch. Its `Mutation report (advisory)` job has `continue-on-error: true`, and always attempts to upload `reports/mutation/` as artifact `mutation-report`; if no reports exist it warns. The pilot has `thresholds.break: 0`, so there is no fixed minimum mutation score or merge gate. Inspect surviving/uncovered mutants rather than treating an advisory job as acceptance evidence.

The current working-tree run passed all 65 direct tests. A fresh Stryker run tested 217 mutants: 209 killed (96.31%), 8 survived, 0 uncovered, 0 timeouts, and 0 errors. The observability helper killed 89 of 95 mutants (93.68%); all its mutants were covered. The report reflects this working tree and is not evidence of CI or a deployed revision. Review survivors in the HTML report instead of treating the score as a merge gate.

## Observability test boundary

Colocated tests cover public analytics configuration gating, SDK privacy options and identity/reset behavior with a mocked PostHog SDK, and request-ID/error sanitization with a captured console logger. The access integration suite also checks the compiled Worker's public analytics configuration. These test definitions do not establish a passing final run, hosted ingestion, replay privacy in real recordings, Cloudflare trace lookup, or source-map upload. Use the [diagnostic guide](docs/how-to/investigate-application-failure.md) for live verification; the documentation update itself makes no deployment claim.

## Historical migration verification

The migration owner reports that `bun run check` completed successfully (exit 0) in the migration worktree. It included formatting, lint, boundary checks and proofs, workspace and test-fixture typechecks, dependency audit, build, 36 Vitest tests, and three Chromium scenarios. The health regression checks that `/healthz` returns the revision supplied to the compiled Worker. The fixture uses a synthetic SHA; this proves binding propagation, not the identity of a cloud deployment. The suite also includes three database routing regressions: hosted Neon, pooled Neon, and the disposable loopback proxy. Those tests intercept HTTP requests; they do not contact hosted Neon. A separate direct `Website.Vite` smoke run verified database readiness, the homepage (200), auth health (200), and anonymous profile denial (401) using disposable data and synthetic credentials. After idempotent test-server and wrapper signal handlers were added, browser teardown was rerun; process and container inspection found no test Worker or Compose leftovers. These are local results, not CI or cloud validation.

## External verification limits

[Agent checks passed for commit `7450d01`](https://github.com/prumod/cairn-web/actions/runs/39412740952), before the revision-binding change. That result does not cover later changes. The [deployment guide](docs/how-to/run-company-profile.md#verification-and-deployment-limits) records separate live checks at the later revision `100ae4e3b91fe1b054c84793616d822a83707b97`. Neither those checks nor the earlier CI result cover the current working-tree observability and mutation changes. Shared remote Alchemy state and production readiness for this candidate remain unverified. Local controlled-identity tests do not establish cloud provisioning or real Google OAuth behavior.

Any cloud cutover requires separate authorization and fresh CI, provider/state/secrets/OAuth setup, and live tests against the exact candidate revision.
