#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bun install --frozen-lockfile --ignore-scripts
exec bun run hooks:install
