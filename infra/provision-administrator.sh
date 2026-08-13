#!/usr/bin/env bash
set -euo pipefail

if (( $# != 1 )); then
  echo "usage: $0 ACCOUNT_NAME" >&2
  exit 2
fi

if [[ -t 0 ]]; then
  read -r -s -p "Initial administrator password: " administrator_password
  printf '\n' >&2
else
  IFS= read -r administrator_password
fi

if (( ${#administrator_password} < 10 )); then
  echo "administrator password must contain at least 10 characters" >&2
  exit 2
fi

readonly deploy_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
printf '%s\n' "$administrator_password" | docker compose \
  --env-file "${deploy_directory}/.env.production" \
  --env-file "${deploy_directory}/.release.env" \
  -f "${deploy_directory}/compose.yml" \
  -f "${deploy_directory}/compose.production.yml" \
  run --rm --no-deps -T api admin provision "$1"
