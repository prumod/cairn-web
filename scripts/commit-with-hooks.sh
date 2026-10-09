#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/git-checks.sh"

# Checks certify the index, so Git must not replace it with working-tree content.
needs_value=false
fixup_value=false
for argument in "$@"; do
  if "$needs_value"; then
    if "$fixup_value" && [[ "$argument" == reword:* ]]; then
      printf 'A reword fixup ignores the staged content; use Git metadata options that commit the checked index.\n' >&2
      exit 2
    fi
    needs_value=false
    fixup_value=false
    continue
  fi
  case "$argument" in
  -m | -F | -C | -c | -t | --message | --file | --reuse-message | --reedit-message | \
    --author | --date | --template | --cleanup | --squash | --trailer)
    needs_value=true
    ;;
  --fixup)
    needs_value=true
    fixup_value=true
    ;;
  --fixup=reword:*)
    printf 'A reword fixup ignores the staged content; use Git metadata options that commit the checked index.\n' >&2
    exit 2
    ;;
  -m?* | -F?* | -C?* | -c?* | -t?* | -S?*) ;;
  --all | --all=* | --include | --include=* | --only | --only=* | --pathspec-from-file* | --)
    printf 'Stage the intended changes first; content-selecting commit options are unsupported.\n' >&2
    exit 2
    ;;
  --*) ;;
  -*a* | -*i* | -*o*)
    printf 'Stage the intended changes first; content-selecting commit options are unsupported.\n' >&2
    exit 2
    ;;
  -*) ;;
  *)
    printf 'Stage paths first instead of passing them to the commit gate.\n' >&2
    exit 2
    ;;
  esac
done

tree=$(git write-tree)
bash "$runner_dir/check-secrets.sh" staged
check_tree "$tree" fast
if [[ "$(git write-tree)" != "$tree" ]]; then
  printf 'The staging area changed during validation. Retry the commit.\n' >&2
  exit 1
fi
# Clean up before exec so Git's exit status and signals remain unchanged.
rm -rf "$temp"
trap - EXIT
exec git commit "$@"
