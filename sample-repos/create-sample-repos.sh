#!/usr/bin/env bash
# Creates the sample repos on GitHub, pushes main, and opens one PR in each.
# Requires: git, and the GitHub CLI (`gh auth login` done first).
#
#   ./create-sample-repos.sh                 # public repos under your account
#   VISIBILITY=private ./create-sample-repos.sh
set -euo pipefail

OWNER="${OWNER:-$(gh api user --jq .login)}"
VISIBILITY="${VISIBILITY:-public}"
REPOS=(payments-service user-service web-frontend)
HERE="$(cd "$(dirname "$0")" && pwd)"
WORK="$(mktemp -d)"

for repo in "${REPOS[@]}"; do
  echo "==> $OWNER/$repo"
  cp -r "$HERE/$repo" "$WORK/$repo"
  cd "$WORK/$repo"

  # Point cortex.yaml / links at the actual owner.
  sed -i.bak "s#bensnyderdurango/#$OWNER/#g" cortex.yaml && rm cortex.yaml.bak
  sed -i.bak "s#@bensnyderdurango#@$OWNER#g" .github/CODEOWNERS && rm .github/CODEOWNERS.bak

  git init -q -b main
  git add -A
  git commit -q -m "Initial commit: $repo sample service"

  gh repo create "$OWNER/$repo" "--$VISIBILITY" \
    --description "Sample $repo for a Cortex catalog demo" \
    --source . --remote origin --push

  # Feature branch + pull request.
  pr="$HERE/_pull-requests/$repo"
  title="$(head -n1 "$pr/PR.md")"
  body="$(tail -n +2 "$pr/PR.md")"
  git checkout -q -b feature/sample-change
  rsync -a --exclude PR.md "$pr/" ./
  git add -A
  git commit -q -m "$title"
  git push -q -u origin feature/sample-change
  gh pr create --repo "$OWNER/$repo" --base main --head feature/sample-change \
    --title "$title" --body "$body"

  cd "$HERE"
done

rm -rf "$WORK"
echo "Done. Repos: ${REPOS[*]/#/https://github.com/$OWNER/}"
