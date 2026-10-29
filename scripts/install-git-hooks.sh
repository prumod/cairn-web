#!/usr/bin/env bash
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"
existing=$(git config --get core.hooksPath || true)
if [[ -n "$existing" && "$existing" != .githooks ]]; then
  printf 'Refusing to replace existing core.hooksPath: %s\n' "$existing" >&2
  exit 2
fi
hooks=$(git rev-parse --git-path hooks)
for hook in pre-commit pre-push; do
  if [[ -f "$hooks/$hook" && "$existing" != .githooks ]]; then
    printf 'Existing native hook needs integration first: %s\n' "$hooks/$hook" >&2
    exit 2
  fi
done
git config --local core.hooksPath .githooks
