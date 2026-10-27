#!/usr/bin/env bash
set -euo pipefail
bash "$(dirname "$0")/install-git-hooks.sh"
exec git push "$@"
