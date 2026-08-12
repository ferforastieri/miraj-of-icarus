#!/usr/bin/env bash
set -euo pipefail

if (( $# != 1 )); then
  echo "usage: $0 GIT_SHA" >&2
  exit 2
fi

readonly release_sha="$1"
readonly deploy_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly production_env="${deploy_directory}/.env.production"
readonly release_env="${deploy_directory}/.release.env"
readonly previous_release="${deploy_directory}/.previous-release"

[[ $release_sha =~ ^[0-9a-f]{40}$ ]] || {
  echo "GIT_SHA must be a full lowercase commit SHA" >&2
  exit 2
}
test -f "$production_env" || {
  echo "missing ${production_env}; copy and complete .env.production.example" >&2
  exit 1
}

compose() {
  docker compose \
    --env-file "$production_env" \
    --env-file "$release_env" \
    -f "${deploy_directory}/compose.yml" \
    -f "${deploy_directory}/compose.production.yml" \
    "$@"
}

write_release() {
  umask 077
  printf 'MASICARUS_IMAGE_TAG=%s\n' "$1" > "$release_env"
}

wait_for_services() {
  local services=(postgres redis api main-server login-server lobby-server caddy)
  local service container status all_ready
  for _ in $(seq 1 60); do
    all_ready=true
    for service in "${services[@]}"; do
      container="$(compose ps -q "$service")"
      if [[ -z $container ]]; then
        all_ready=false
        break
      fi
      status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container")"
      if [[ $status != healthy && $status != running ]]; then
        all_ready=false
        break
      fi
    done
    if [[ $all_ready == true ]]; then
      return 0
    fi
    sleep 5
  done
  return 1
}

old_sha=""
if [[ -f $release_env ]]; then
  old_sha="$(sed -n 's/^MASICARUS_IMAGE_TAG=//p' "$release_env")"
fi

write_release "$release_sha"
compose pull
compose up -d --no-build --remove-orphans

if wait_for_services; then
  if [[ $old_sha =~ ^[0-9a-f]{40}$ ]]; then
    printf '%s\n' "$old_sha" > "$previous_release"
  fi
  compose ps
  exit 0
fi

compose ps >&2
compose logs --tail 100 api main-server login-server lobby-server caddy >&2
if [[ $old_sha =~ ^[0-9a-f]{40}$ ]]; then
  echo "deployment failed; rolling back to ${old_sha}" >&2
  write_release "$old_sha"
  compose pull
  compose up -d --no-build --remove-orphans
  wait_for_services
fi
exit 1
