#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
source scripts/timing.sh

run() {
  printf '\nChecking: %s\n' "$*"
  local command="$*"
  if timed "${command#bun run }" "$@"; then return 0; else
    status=$?
    printf 'FAILED (%s). Reproduce from the repository root: %s\n' "$status" "$*" >&2
    return "$status"
  fi
}

# Scopes route each check to the earliest layer that fits its cost:
# commit runs seconds-long checks, push adds the medium-cost compile checks,
# and full (required "Agent checks" CI and `bun run check`) runs everything.
# Tests stay in full only: CI repeats them authoritatively for every PR, and
# test-first work already runs the relevant tests while changing behaviour.
scope=${1:-full}
case "$scope" in
commit | push | full) ;;
*)
  printf 'Expected commit, push, or full check scope.\n' >&2
  exit 2
  ;;
esac

run bun run format:check
run bun run lint
run bun run lint:boundaries
run bun run check:transcriptions
[[ "$scope" == commit ]] && exit 0

run bun run typecheck
run bun run build
[[ "$scope" == push ]] && exit 0

# Proves the boundary rules themselves; they change rarely, so CI suffices.
run bun run test:boundaries
# Advisory data requires the network.
run bun run audit
run bun run test:fast:run
run bun run test:browser:run
