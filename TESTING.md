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
- `bun run check` runs formatting, lint, boundary checks/proofs, legacy Blueprint/candidate-gate checks, typecheck, dependency audit, and the full test command.

`check:blueprints` and `check:candidate-gate` validate retained repository policy and workflow artifacts. They do not validate a Cloudflare deployment or make the legacy Render workflows applicable to the current Worker runtime.

## Current migration verification

The migration owner reports that `bun run check` completed successfully (exit 0) in the migration worktree. It included formatting, lint, boundary checks and proofs, workspace and test-fixture typechecks, dependency audit, build, 36 Vitest tests, and three Chromium scenarios. The health regression checks that `/healthz` returns the revision supplied to the compiled Worker. The fixture uses a synthetic SHA; this proves binding propagation, not the identity of a cloud deployment. The suite also includes three database routing regressions: hosted Neon, pooled Neon, and the disposable loopback proxy. Those tests intercept HTTP requests; they do not contact hosted Neon. A separate direct `Website.Vite` smoke run verified database readiness, the homepage (200), auth health (200), and anonymous profile denial (401) using disposable data and synthetic credentials. After idempotent test-server and wrapper signal handlers were added, browser teardown was rerun; process and container inspection found no test Worker or Compose leftovers. These are local results, not CI or cloud validation.

## External and legacy verification limits

[Agent checks passed for commit `7450d01`](https://github.com/prumod/cairn-web/actions/runs/39412740952), before the revision-binding change. That result does not cover later changes. No external Cloudflare provisioning/deployment, remote Alchemy state, real Google OAuth login, or production readiness has been verified for this migration. Local controlled-identity tests do not establish any of these outcomes.

The existing Render files and deployed-E2E/security workflows are retained historical artifacts for the previous runtime. `bun run test:deployed` still targets `https://cairn-testing.onrender.com` and requires real Google credentials; it does not exercise or deploy the current Workers application and is not acceptance evidence for this migration. Do not run it as a substitute for Worker validation. Any cloud cutover requires separate authorization and fresh CI, provider/state/secrets/OAuth setup, and live tests against the exact candidate revision.
