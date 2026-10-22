#!/usr/bin/env bash
# Attribute this worktree's commits to a repository collaborator.
#
# Agents in the shared T3 host run under one GitHub login. This sets the commit
# author for the current linked worktree only, using the collaborator's GitHub
# noreply email, so GitHub links each commit to their profile. Pushes and pull
# requests still use the host's GitHub login.
#
# Usage: scripts/use-github-identity.sh             (list collaborator logins)
#        scripts/use-github-identity.sh <github-login>
set -euo pipefail

repo="$(gh repo view --json nameWithOwner --jq .nameWithOwner)"
login="${1:-}"
if [[ -z "$login" ]]; then
  gh api --paginate "repos/$repo/collaborators" --jq '.[].login'
  exit 0
fi

if [[ "$(git rev-parse --path-format=absolute --git-dir)" == "$(git rev-parse --path-format=absolute --git-common-dir)" ]]; then
  echo "Run this in a linked worktree (a T3 thread with New worktree), not the main checkout." >&2
  exit 1
fi

if ! gh api "repos/$repo/collaborators/$login" --silent 2>/dev/null; then
  echo "$login is not a collaborator on $repo." >&2
  exit 1
fi

user="$(gh api "users/$login" --jq '[.id, .login, (.name // .login)] | @tsv')"
IFS=$'\t' read -r id canonical_login name <<<"$user"

git config extensions.worktreeConfig true
git config --worktree user.name "$name"
git config --worktree user.email "$id+$canonical_login@users.noreply.github.com"
git config --worktree cairn.author "$canonical_login"

echo "Commits in this worktree are authored by $name <$id+$canonical_login@users.noreply.github.com>."
