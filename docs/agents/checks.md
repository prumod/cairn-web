# Agent Git gates

Stage the intended changes before executing `scripts/commit-with-hooks.sh` with the Git commit arguments. It checks a disposable staged snapshot, scans the staged diff for secrets, and commits only after success. Working-tree selection (`-a`, `-i`, `-o`, or path arguments) is unsupported: use staging to select content.

Execute `scripts/push-with-hooks.sh` with the Git push arguments. Git's dry run identifies the outgoing refs; each committed snapshot receives the full checks and a reachable-history secret scan before the real push. The dry run contacts the remote, so authentication is required twice. Dirty working files do not affect either gate.

Both files preserve the staging area and working files. Failed checks stop the Git operation. No native Git hooks or persistent Git settings are installed. Index/ref comparisons detect changes during validation, but do not atomically lock the final Git operation.

## Setup and recovery

With host prerequisites installed, execute `scripts/setup.sh` to prepare the locked dependencies, scanner, and browser. The human `setup-project` wizards also provision missing host tools.

The gates need Bash, Git, Bun 1.3.14, Node.js 22.12+, and Gitleaks 8.30.0. Execute `scripts/install-gitleaks.sh` on Linux x64/arm64 to install the checksum-verified scanner into ignored `.tools/`. On other hosts, set `GITLEAKS_BIN` to an absolute path to that version.

Install Chromium with `PLAYWRIGHT_SKIP_BROWSER_GC=1 bunx --no-install playwright install chromium` before running browser scenarios. This preserves browsers used by other local tools. CI installs its system dependencies too.

The full check (push and CI) audits all locked dependencies, including development tools, with `bun audit`. Any reported vulnerability or unavailable advisory service blocks it. The fast commit check omits this network-dependent step. Auditing reports findings without changing dependencies or the lockfile.

Checks report their failing invocation. Fix the relevant content, restage it for a commit, and execute the gate again. Formatting is validation-only. When a staged snapshot fails but the working tree passes, check for unstaged fixes; the gate validates the commit, not those fixes.

For test boundaries and the distinction between an empty suite and verified behavior, see [Testing](../../TESTING.md). Package scripts and native test configuration define runnable commands and discovered files.

## Shared enforcement

PR CI invokes the same check implementations without committing or pushing. Its secret scan covers the introduced commits, including secrets deleted by a later commit. The stable `Agent checks` status must be required on `main` after the workflow has run successfully. Local files are an agent convention; branch protection is the shared enforcement boundary.
