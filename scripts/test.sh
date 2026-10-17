#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bun run build
bun run test:fast:run
exec bun run test:browser:run
