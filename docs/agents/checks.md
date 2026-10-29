# Agent Git gates

[Lefthook](https://lefthook.dev/) runs the Git hooks that `lefthook.yml` declares: `scripts/pre-commit.sh` and `scripts/pre-push.sh`. Run `bun run hooks:install` once per clone (setup and update run it after `bun install`). Git shares the installed hooks with linked worktrees, and each worktree runs its own `lefthook.yml` and scripts. Lefthook refuses to install while `core.hooksPath` is set; a clone that used the earlier `.githooks` directory must first run `git config --unset-all --local core.hooksPath`. Lefthook renames existing native hooks to `<hook>.old`.

The installed hooks run the worktree's pinned `node_modules/.bin/lefthook`, never a global copy, and `min_version` rejects an older one. In a worktree without `bun install`, they fail with `node_modules/.bin/lefthook: not found`; run `bun install` and retry.

The pre-commit hook scans the actual staged diff for secrets and validates a disposable snapshot. This supports Git's normal content selection, including `commit -a` and path arguments. Linked worktrees still require the author configured as described in `AGENTS.md`.

Both hooks scan for secrets and check that relative Markdown links in the commit or pushed tree point to tracked files (`scripts/check-doc-links.mjs`; anchors are not checked). They then classify the diff. If every changed path is Markdown and no non-Markdown tracked file consumes a changed document, nothing else runs. A file consumes a document when it names the document's path, or its filename when no other tracked file shares it. A file that reads Markdown (a loader) also consumes the documents in a directory it names, and every document when it uses a wildcard or recursion. Consumers are checked in both snapshots; a loader that builds paths from segments is not matched, so CI remains the backstop. Any other change runs the existing checks: formatting, lint, boundaries and transcriptions at commit; typecheck and build additionally at push. The policy is the same for every author. Tests and dependency audits remain in CI and `bun run check`.

Pre-push reads Git's outgoing refs directly, scans outgoing history for secrets, and checks every outgoing commit's diff before deciding whether the final snapshot needs code checks. This catches code changed and later reverted. New branches or unavailable remote bases conservatively scan all reachable history. Ref deletions have no new content to validate. Dirty working files do not affect the snapshots.

Native Git bypasses such as `--no-verify` and `LEFTHOOK=0` remain available, so CI remains the shared enforcement boundary.

Each hook records per-phase durations in `<git-common-dir>/check-timings/` (newest 50 runs); `bun run checks:timings [count]` shows them. Validation leaves working files unchanged. Index comparisons detect staging changes during validation but do not atomically lock the final operation.

## Setup and recovery

With host prerequisites installed, execute `scripts/setup.sh` to prepare the locked dependencies, scanner, and browser. The human `setup-project` wizards also provision missing host tools, including Docker, start the development database from `compose.dev.yaml`, apply its migrations, and write the ignored `packages/infra/.env.local`.

The gates need Bash, Git, Bun 1.3.14, Node.js 22.12+, and Gitleaks 8.30.0. On Linux x64/arm64 the hooks run `scripts/install-gitleaks.sh` when `.tools/gitleaks` is missing, which installs the checksum-verified scanner into ignored `.tools/`; each linked worktree installs it once. On other hosts, set `GITLEAKS_BIN` to an absolute path to that version.

Install Chromium with `PLAYWRIGHT_SKIP_BROWSER_GC=1 bunx --no-install playwright install chromium` before running browser scenarios. This preserves browsers used by other local tools. CI installs its system dependencies too.

Each commit or push that needs code checks runs `bun install --frozen-lockfile` in a clean snapshot. Recorded runs range from 1 s, with warm caches, to 12 minutes after the Bun cache was purged or the lockfile changed. The hook prints a notice before it starts. Run `bun run checks:timings` to see where a run spent its time, and do not pipe the Git command through `tail`, which hides its exit status.

The full check (CI and `bun run check`) audits all locked dependencies, including development tools, with `bun audit`. Any reported vulnerability or unavailable advisory service blocks it. The commit and push gates omit this network-dependent step. Auditing reports findings without changing dependencies or the lockfile.

Checks report their failing invocation. Fix the relevant content, restage it for a commit, and execute the gate again. Formatting is validation-only. When a staged snapshot fails but the working tree passes, check for unstaged fixes; the gate validates the commit, not those fixes.

For test boundaries and coverage limits, see [Testing](../../TESTING.md). Package scripts and native test configuration define runnable commands and discovered files.

## Local application and test process cautions

`bun run dev` starts `packages/infra`'s Alchemy development stage, which serves TanStack Start in the local Cloudflare Workers runtime. Alchemy uses local state for this workflow; `.alchemy` is generated local state/cache, not remote provider state or proof of deployment. Standalone Vite dev/preview commands are not supported because the app requires the Workers runtime. `bun run dev:db` starts the persistent development database (PostgreSQL and the local Neon HTTP proxy) from `compose.dev.yaml` and applies pending migrations; it is separate from the disposable `compose.test.yaml` project that the test wrapper owns. Root `bun run typecheck` runs `env:generate` before workspace type checks. Keep generated `apps/web/src/env.ts` and `packages/db/src/env.ts` out of version control; retain the safe `.env.schema` inputs and keep actual credentials in ignored local environment files.

`bun run test:fast` and `bun run test:browser` build the application and use `scripts/with-test-postgres.mjs`. It starts a uniquely named Docker Compose project from `compose.test.yaml`, with digest-pinned PostgreSQL 18.6 and a pinned local Neon HTTP proxy, loopback-only dynamic ports, and temporary database storage. The wrapper supplies `TEST_DATABASE_URL` and `TEST_NEON_PORT`, then runs `docker compose down --volumes --remove-orphans`. Each app fixture creates a separate database, applies migrations through the Neon HTTP driver, and starts the compiled Worker with the test-only Alchemy stack in `packages/infra/test/alchemy.run.ts` using local `workerd` and Alchemy state. Browser fixtures add a controlled-identity proxy outside the application.

Do not start or stop a separate `pg_ctl` database for these suites. The test wrapper owns the Compose services and waits for the test process and asynchronous teardown; the browser server keeps idempotent signal handlers while cleanup finishes. CI invokes the same `scripts/check.sh full` entrypoint and relies on the wrapper's Compose pair rather than a separate PostgreSQL service. The local and CI flows do not provision Cloudflare, create remote Alchemy state, or validate Google OAuth/deployment.

For the current test and audit status, see [Testing](../../TESTING.md).

## Shared enforcement

PR CI invokes the same check implementations without committing or pushing. Its secret scan covers the introduced commits, including secrets deleted by a later commit. The stable `Agent checks` status must be required on `main` after the workflow has run successfully. Local hooks provide early feedback; branch protection is the shared enforcement boundary.
