# Testing

## Test boundaries

Vitest discovers colocated tests under `{apps/web,shared}/src/**/*.{spec,test}.{ts,tsx}` and `packages/*/src/**/*.{spec,test}.{ts,tsx}`. It also discovers acceptance/typical integration tests under `apps/web/tests/{acceptance,typical}/integration/`. Playwright-BDD discovers capability contracts under `features/company/` and `features/access/`, with step bindings under `apps/web/tests/acceptance/e2e/`.

The access integration and browser tests target the built TanStack Start Worker, including the feature-owned server-function transport, database-backed access, origin checks, and authentication handling. Colocated backoffice tests cover infrastructure-independent application rules, the application-failure-to-HTTP mapping, and Query behavior with injected fakes. The Worker integration tests cover Zod input rejection, session and origin checks, and no-store responses. Company-profile scenarios still refer to the removed page/API and need revision. Browser identities are controlled fixtures; they do not run Google's OAuth redirect, consent, state, or PKCE flow.

Lint rejects module mocking (`vi.mock`); tests inject fake dependencies through the public interface instead.

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

For PR #122's tested head, `bun run test:mutation` passed all 65 direct tests. A fresh Stryker run tested 217 mutants: 209 killed (96.31%), 8 survived, 0 uncovered, 0 timeouts, and 0 errors. The observability helper killed 89 of 95 mutants (93.68%); all its mutants were covered. Review survivors in the HTML report instead of treating the score as a merge gate.

After reviewing those survivors, the current follow-up working tree adds direct assertions for the five-frame cap, allowed frame basenames, and a stack whose first line is already a frame. The parser now checks every line and filters out a standard `Error:` header through its existing frame pattern. Its fresh `bun run mutation` run passed 68 tests and killed 212/216 mutants (98.15%); 4 survived, with 0 uncovered mutants, timeouts, or errors. The observability helper killed 92/94 mutants (97.87%).

The same follow-up tree passes `bun run check`: 93 fast tests, 3 browser scenarios, and no dependency vulnerabilities. Lint reports the same three existing warnings. The dependency overrides pin `@hono/node-server` to 2.1.3 and `seroval` to 1.6.11 to address newly reported transitive advisories. These follow-up changes have not yet run in CI or been deployed.

The four survivors were reviewed: `DependencyUnavailable`'s message is not returned or logged; optional chaining guards a location capture that the regex requires; the pinned Neon driver currently exposes `fetchEndpoint` as a function, leaving the compatibility fallback branch inactive; and the explicit undefined-revision check is redundant because the 40-character regex already rejects `undefined`.

## Observability test boundary

Colocated tests cover public analytics configuration gating, SDK privacy options and identity/reset behavior with a fake PostHog SDK injected through `createAnalytics`, and request-ID/error sanitization with a captured console logger. The access integration suite also checks the compiled Worker's public analytics configuration. These tests do not establish hosted ingestion, replay privacy in a real recording, Cloudflare trace lookup, or source-map remapping. See the dated evidence below and the [diagnostic guide](docs/how-to/investigate-application-failure.md) for the current live checks and their limits.

## Feature-structure verification limits

The feature-structure implementation passed formatting, lint, boundary lint and proofs, type checks, the production build, the dependency audit, and the 103 colocated fast tests. The built Worker contains the renamed server-function IDs that the integration helper computes. Worker integration execution remains unverified: Alchemy 2.0.0-beta.83 rejects the redundant `nodejs_compat` flag at Worker startup (it is the default for compatibility dates from 2026-08-04), so the three integration spec files and the browser suite could not start the Worker. Existing company-profile acceptance scenarios are also stale after the feature removal. These results do not establish passing Worker integration or browser suites.

## Historical migration verification

The migration owner reports that `bun run check` completed successfully (exit 0) in the migration worktree. It included formatting, lint, boundary checks and proofs, workspace and test-fixture typechecks, dependency audit, build, 36 Vitest tests, and three Chromium scenarios. The health regression checks that `/healthz` returns the revision supplied to the compiled Worker. The fixture uses a synthetic SHA; this proves binding propagation, not the identity of a cloud deployment. The suite also includes three database routing regressions: hosted Neon, pooled Neon, and the disposable loopback proxy. Those tests intercept HTTP requests; they do not contact hosted Neon. A separate direct `Website.Vite` smoke run verified database readiness, the homepage (200), auth health (200), and anonymous profile denial (401) using disposable data and synthetic credentials. After idempotent test-server and wrapper signal handlers were added, browser teardown was rerun; process and container inspection found no test Worker or Compose leftovers. These are local results, not CI or cloud validation.

## Merged and hosted verification (2026-10-28)

PR [#122](https://github.com/prumod/cairn-web/pull/122) merged as `ee24e21ea46428d32d18e15006f5b011050f2b23` from tested head `d0f129da787b9b9580b439c17ae9b7a1e5bc25f7`. `Agent checks` and the advisory `Mutation report` job succeeded on that head. The separate mutation job remains advisory and has no score gate.

- The advisory mutation job succeeded on PR #122. The current follow-up working-tree score and survivor details are recorded in [Scoped mutation pilot](#scoped-mutation-pilot); those follow-up changes have not yet run in CI. The report covers the selected direct-source modules only.
- `bun run check` passed, including the fast and browser suites (90 fast tests and 3 browser scenarios). Lint reported three pre-existing warnings; the dependency audit found no vulnerabilities.
- Three additional fresh `bun run test:fast:run` runs each passed all 90 tests. Each run started a unique disposable PostgreSQL/Neon proxy pair and exercised the schema migrations. `scripts/with-test-postgres.mjs` now waits for an HTTP `SELECT 1` through the proxy before launching the tests, with a 60-second overall timeout and 2-second request timeout. No proxy-startup failure occurred in these three runs. This supports the readiness fix but does not guarantee every host or startup condition.
- Testing is deployed at the merged revision. `/healthz` returned `ready` and that exact SHA. `/api/analytics-config` returned `null`, as intended for testing.
- Production was still serving `5ff1cf43fbaaff790a1d959631947424c73a27fb` during the 2026-10-28 check. Its analytics configuration returned the EU PostHog host and a token in the expected public `phc_` format. Production deployment of the merged revision and its telemetry remains pending the production-scoped Neon key and a safe Alchemy plan.
- A pre-merge production replay showed masked page text, `Company_profile_viewed` and `Identify` activity, and 0 clicks, 0 keystrokes, and 0 recorded errors. This verifies visible masking and those activity-panel signals for that sample only. The raw snapshot and network payload were not audited; the replay does not verify the merged build or save events.
- A testing-stage Cloudflare REST query returned 2 events and 2 traces, with 2 matching trace IDs, for its 30-minute window. This verifies native query access and trace availability for those events. It does not link an application `X-Request-ID` to a platform trace.
- Vite server source maps were generated and the testing deployment upload path included them as `application/source-map`. Live mapping of an uncaught Worker exception to an original source frame remains unverified. Sanitized `safeFrames` logged inside Cairn are not source-mapped.

The production deployment, production telemetry for the merged revision, raw replay/network payload audit, source-map remapping, and application-request-to-platform-trace correlation remain open verification items. Local controlled-identity tests do not establish real Google OAuth behavior.
