#!/usr/bin/env bash
set -euo pipefail
root=$(git rev-parse --show-toplevel)
scanner="${GITLEAKS_BIN:-$root/.tools/gitleaks}"

if [[ ! -x "$scanner" ]]; then
  printf 'Gitleaks is missing. Execute scripts/install-gitleaks.sh first.\n' >&2
  exit 2
fi

case "${1:-}" in
staged)
  git diff --cached --no-ext-diff --no-textconv --binary |
    "$scanner" detect --pipe --redact --no-banner
  ;;
history)
  range=${2:---all}
  # Gitleaks can exit successfully after Git rejects an unavailable scan base.
  if ! git -C "$root" rev-list "$range" -- >/dev/null; then
    printf 'Cannot scan unavailable Git history: %s\n' "$range" >&2
    exit 2
  fi
  "$scanner" detect --source "$root" --log-opts="$range" --redact --no-banner
  ;;
*)
  printf 'Expected staged or history secret-scan scope.\n' >&2
  exit 2
  ;;
esac
