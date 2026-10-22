# Agent Git gates

Stage the intended changes before executing `scripts/commit-with-hooks.sh` with the Git commit arguments. It runs the commit checks (formatting, lint, boundary rules, and transcriptions) on a disposable staged snapshot, scans the staged diff for secrets, and commits only after success. Working-tree selection (`-a`, `-i`, `-o`, or path arguments) is unsupported: use staging to select content. In a linked worktree, the gate first requires the commit author described in `AGENTS.md`.

Execute `scripts/push-with-hooks.sh` with the Git push arguments. Git's dry run identifies the outgoing refs; each committed snapshot receives the push checks (the commit checks plus typecheck and build) and a reachable-history secret scan before the real push. Tests and the dependency audit run only in the full check: the required CI workflow and `bun run check`. The dry run contacts the remote, so authentication is required twice. Dirty working files do not affect either gate.

Each gate run records per-phase durations in `<git-common-dir>/check-timings/` (newest 50 runs); `bun run checks:timings [count]` shows them as job/step durations.

Both files preserve the staging area and working files. Failed checks stop the Git operation. No native Git hooks or persistent Git settings are installed. Index/ref comparisons detect changes during validation, but do not atomically lock the final Git operation.

## Setup and recovery

With host prerequisites installed, execute `scripts/setup.sh` to prepare the locked dependencies, scanner, and browser. The human `setup-project` wizards also provision missing host tools.

The gates need Bash, Git, Bun 1.3.14, Node.js 22.12+, and Gitleaks 8.30.0. Execute `scripts/install-gitleaks.sh` on Linux x64/arm64 to install the checksum-verified scanner into ignored `.tools/`. On other hosts, set `GITLEAKS_BIN` to an absolute path to that version.

Install Chromium with `PLAYWRIGHT_SKIP_BROWSER_GC=1 bunx --no-install playwright install chromium` before running browser scenarios. This preserves browsers used by other local tools. CI installs its system dependencies too.

The full check (CI and `bun run check`) audits all locked dependencies, including development tools, with `bun audit`. Any reported vulnerability or unavailable advisory service blocks it. The commit and push gates omit this network-dependent step. Auditing reports findings without changing dependencies or the lockfile.

Checks report their failing invocation. Fix the relevant content, restage it for a commit, and execute the gate again. Formatting is validation-only. When a staged snapshot fails but the working tree passes, check for unstaged fixes; the gate validates the commit, not those fixes.

For test boundaries and coverage limits, see [Testing](../../TESTING.md). Package scripts and native test configuration define runnable commands and discovered files.

## Local application and test process cautions

`bun run dev` starts `packages/infra`'s Alchemy development stage, which serves TanStack Start in the local Cloudflare Workers runtime. Alchemy uses local state for this workflow; `.alchemy` is generated local state/cache, not remote provider state or proof of deployment. Standalone Vite dev/preview commands are not supported because the app requires the Workers runtime. Root `bun run typecheck` runs `env:generate` before workspace type checks. Keep generated `apps/web/src/env.ts` and `packages/db/src/env.ts` out of version control; retain the safe `.env.schema` inputs and keep actual credentials in ignored local environment files.

`bun run test:fast` and `bun run test:browser` build the application and use `scripts/with-test-postgres.mjs`. It starts a uniquely named Docker Compose project from `compose.test.yaml`, with digest-pinned PostgreSQL 18.6 and a pinned local Neon HTTP proxy, loopback-only dynamic ports, and temporary database storage. The wrapper supplies `TEST_DATABASE_URL` and `TEST_NEON_PORT`, then runs `docker compose down --volumes --remove-orphans`. Each app fixture creates a separate database, applies migrations through the Neon HTTP driver, and starts the compiled Worker with the test-only Alchemy stack in `packages/infra/test/alchemy.run.ts` using local `workerd` and Alchemy state. Browser fixtures add a controlled-identity proxy outside the application.

Do not start or stop a separate `pg_ctl` database for these suites. The test wrapper owns the Compose services and waits for the test process and asynchronous teardown; the browser server keeps idempotent signal handlers while cleanup finishes. CI invokes the same `scripts/check.sh full` entrypoint and relies on the wrapper's Compose pair rather than a separate PostgreSQL service. The local and CI flows do not provision Cloudflare, create remote Alchemy state, or validate Google OAuth/deployment.

For the current test and audit status, see [Testing](../../TESTING.md).

## Shared enforcement

PR CI invokes the same check implementations without committing or pushing. Its secret scan covers the introduced commits, including secrets deleted by a later commit. The stable `Agent checks` status must be required on `main` after the workflow has run successfully. Local files are an agent convention; branch protection is the shared enforcement boundary.
