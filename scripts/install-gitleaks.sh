#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
version=8.30.0
case "$(uname -s)-$(uname -m)" in
Linux-x86_64)
  platform=linux_x64
  checksum=79a3ab579b53f71efd634f3aaf7e04a0fa0cf206b7ed434638d1547a2470a66e
  ;;
Linux-aarch64)
  platform=linux_arm64
  checksum=b4cbbb6ddf7d1b2a603088cd03a4e3f7ce48ee7fd449b51f7de6ee2906f5fa2f
  ;;
*)
  printf 'Gitleaks installer supports Linux x64/arm64. Set GITLEAKS_BIN to a Gitleaks 8.30.0 binary on other hosts.\n' >&2
  exit 2
  ;;
esac
mkdir -p .tools
archive=$(mktemp)
trap 'rm -f "$archive"' EXIT
curl --fail --silent --show-error --location \
  "https://github.com/gitleaks/gitleaks/releases/download/v$version/gitleaks_${version}_${platform}.tar.gz" \
  --output "$archive"
printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check
tar -xzf "$archive" -C .tools gitleaks
.tools/gitleaks version
