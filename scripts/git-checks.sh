#!/usr/bin/env bash
# Shared implementation for the agent's commit and push entry points.
set -euo pipefail

root=$(git rev-parse --show-toplevel)
runner_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
export GITLEAKS_BIN="${GITLEAKS_BIN:-$root/.tools/gitleaks}"
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT

check_tree() {
  local tree=$1 scope=$2 snapshot="$temp/tree"
  rm -rf "$snapshot"
  mkdir -p "$snapshot"
  git archive "$tree" | tar -xf - -C "$snapshot"
  (
    cd "$snapshot"
    bun install --frozen-lockfile --ignore-scripts
    bash scripts/check.sh "$scope"
  )
}
