#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

# Prerequisites are supplied by the existing human setup wizard.
bun install --frozen-lockfile --ignore-scripts
if [[ -z "${GITLEAKS_BIN:-}" || ! -x "$GITLEAKS_BIN" ]]; then
  scripts/install-gitleaks.sh
fi
PLAYWRIGHT_SKIP_BROWSER_GC=1 bunx --no-install playwright install chromium
