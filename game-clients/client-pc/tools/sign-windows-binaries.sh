#!/usr/bin/env bash
set -euo pipefail

if (( $# != 4 )); then
  echo "usage: $0 PFX_FILE PFX_PASSWORD LAUNCHER_EXECUTABLE CLIENT_EXECUTABLE" >&2
  exit 2
fi

readonly pfx_file="$1"
readonly pfx_password="$2"
readonly launcher_executable="$3"
readonly client_executable="$4"
readonly timestamp_url="${MIRAJ_OF_ICARUS_AUTHENTICODE_TIMESTAMP_URL:-http://timestamp.digicert.com}"

command -v osslsigncode >/dev/null || { echo "osslsigncode is required" >&2; exit 1; }
test -s "$pfx_file"
test -n "$pfx_password"
test -f "$launcher_executable"
test -f "$client_executable"

sign_executable() {
  local executable="$1"
  local signed="${executable}.signed"
  osslsigncode sign \
    -pkcs12 "$pfx_file" \
    -pass "$pfx_password" \
    -n "Miraj of Icarus" \
    -i "https://mirajoficarus.com" \
    -h sha256 \
    -ts "$timestamp_url" \
    -in "$executable" \
    -out "$signed"
  osslsigncode verify -in "$signed"
  mv -- "$signed" "$executable"
}

sign_executable "$launcher_executable"
sign_executable "$client_executable"
