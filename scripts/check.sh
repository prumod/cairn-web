#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

run() {
  printf '\nChecking: %s\n' "$*"
  if "$@"; then return 0; else
    status=$?
    printf 'FAILED (%s). Reproduce from the repository root: %s\n' "$status" "$*" >&2
    return "$status"
  fi
}

scope=${1:-full}
case "$scope" in
fast | full) ;;
*)
  printf 'Expected fast or full check scope.\n' >&2
  exit 2
  ;;
esac

run bun run format:check
run bun run lint
run bun run lint:boundaries
run bun run test:boundaries
run bun run typecheck
if [[ "$scope" == full ]]; then
  # Advisory data requires the network; keep it out of the fast commit gate.
  run bun run audit
  run bun run test
else
  run bun run test:fast
fi
