#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bun run test:fast
# Browser scenarios target the build, not a separately maintained dev server.
bun run build
exec bun run test:browser
