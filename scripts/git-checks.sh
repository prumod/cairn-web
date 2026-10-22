#!/usr/bin/env bash
# Shared implementation for the agent's commit and push entry points.
set -euo pipefail

root=$(git rev-parse --show-toplevel)
runner_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
export GITLEAKS_BIN="${GITLEAKS_BIN:-$root/.tools/gitleaks}"
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT
source "$runner_dir/timing.sh"

# Timing runs live in the shared Git directory, outside every working tree, so
# all worktrees report to one place. Keep the newest 50 runs.
timings_dir="$(git rev-parse --path-format=absolute --git-common-dir)/check-timings"
mkdir -p "$timings_dir"
export CHECK_TIMINGS_FILE="$timings_dir/$(date -u +%Y%m%dT%H%M%SZ)-$(basename "$0" .sh)-$$.jsonl"
printf '{"gate":"%s","worktree":"%s","branch":"%s","start":%s}\n' \
  "$(basename "$0" .sh)" "$root" "$(git branch --show-current)" "$EPOCHREALTIME" >"$CHECK_TIMINGS_FILE"
ls -1t "$timings_dir"/*.jsonl | tail -n +51 | xargs -r rm -f

snapshot_tree() {
  rm -rf "$2"
  mkdir -p "$2"
  git archive "$1" | tar -xf - -C "$2"
}

check_tree() {
  local tree=$1 scope=$2 snapshot="$temp/tree"
  timed "Snapshot" snapshot_tree "$tree" "$snapshot"
  (
    cd "$snapshot"
    timed "Install dependencies" bun install --frozen-lockfile --ignore-scripts
    bash scripts/check.sh "$scope"
  )
}
