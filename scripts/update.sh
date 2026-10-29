#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/install-git-hooks.sh
exec bun install --frozen-lockfile --ignore-scripts
