#!/usr/bin/env bash
set -euo pipefail
source "$(git rev-parse --show-toplevel)/scripts/git-checks.sh"
# The shared T3 host runs every agent under one Git identity, and T3 does not
# record who started a thread, so each linked worktree names its author once.
if [[ "$(git rev-parse --path-format=absolute --git-dir)" != "$(git rev-parse --path-format=absolute --git-common-dir)" ]] &&
  ! git config --worktree --get cairn.author >/dev/null; then
  printf 'This worktree has no commit author. Set it as AGENTS.md describes, then retry the commit.\n' >&2
  exit 2
fi

tree=$(git write-tree)
base=$(git rev-parse --verify HEAD 2>/dev/null || git hash-object -t tree /dev/null)
export CHECK_TIMINGS_GROUP=staged
timed "Secret scan" bash "$runner_dir/check-secrets.sh" staged
timed "Documentation links" node "$runner_dir/check-doc-links.mjs" "$tree"
scope=$(node "$runner_dir/check-scope.mjs" "$base" "$tree")
if [[ "$scope" == code ]]; then
  check_tree "$tree" commit
else
  printf 'Documentation-only diff: secret scan sufficient.\n'
fi
if [[ "$(git write-tree)" != "$tree" ]]; then
  printf 'The staging area changed during validation. Retry the commit.\n' >&2
  exit 1
fi
