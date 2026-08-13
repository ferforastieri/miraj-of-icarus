#!/usr/bin/env bash
set -euo pipefail

if (( $# != 1 )); then
  echo "usage: $0 ACCOUNT_NAME" >&2
  exit 2
fi

readonly deploy_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
docker compose \
  --env-file "${deploy_directory}/.env.production" \
  --env-file "${deploy_directory}/.release.env" \
  -f "${deploy_directory}/compose.yml" \
  -f "${deploy_directory}/compose.production.yml" \
  run --rm --no-deps api admin promote "$1"
