#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/git-checks.sh"

# Ask Git which refs it would push, including first pushes and explicit refspecs.
git push --dry-run --porcelain "$@" >"$temp/push-plan"
refs=()
commits=()
while IFS=$'\t' read -r flag refspec summary; do
  case "$flag" in
  ' ' | + | '*')
    ref=${refspec%%:*}
    commit=$(git rev-parse --verify "$ref^{commit}") || {
      printf 'Only refs pointing to commits can be checked: %s\n' "$ref" >&2
      exit 2
    }
    refs+=("$ref")
    commits+=("$commit")
    ;;
  esac
done <"$temp/push-plan"

for index in "${!commits[@]}"; do
  commit=${commits[$index]}
  # Scan reachable history too: deletion of a secret does not erase its commit.
  bash "$runner_dir/check-secrets.sh" history "$commit"
  check_tree "$commit" full
done

for index in "${!refs[@]}"; do
  if [[ "$(git rev-parse "${refs[$index]}^{commit}")" != "${commits[$index]}" ]]; then
    printf 'A push ref changed during validation. Retry the push.\n' >&2
    exit 1
  fi
done

rm -rf "$temp"
trap - EXIT
exec git push "$@"
