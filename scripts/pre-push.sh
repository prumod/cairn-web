#!/usr/bin/env bash
set -euo pipefail
source "$(git rev-parse --show-toplevel)/scripts/git-checks.sh"
while read -r local_ref local_sha remote_ref remote_sha; do
  [[ "$local_sha" =~ ^0+$ ]] && continue
  git rev-parse --verify "$local_sha^{commit}" >/dev/null
  range=$local_sha
  if [[ ! "$remote_sha" =~ ^0+$ ]] && git cat-file -e "$remote_sha^{commit}" 2>/dev/null; then
    range="$remote_sha..$local_sha"
  fi
  export CHECK_TIMINGS_GROUP=${local_sha:0:7}
  timed "Secret scan" bash "$runner_dir/check-secrets.sh" history "$range"
  timed "Documentation links" node "$runner_dir/check-doc-links.mjs" "$local_sha"
  # Inspect every outgoing commit so a later revert cannot hide code changes.
  while read -r commit; do
    parent=$(git rev-parse "$commit^" 2>/dev/null || git hash-object -t tree /dev/null)
    scope=$(node "$runner_dir/check-scope.mjs" "$parent" "$commit")
    if [[ "$scope" == code ]]; then
      check_tree "$local_sha" push
      break
    fi
  done < <(git rev-list "$range")
done
