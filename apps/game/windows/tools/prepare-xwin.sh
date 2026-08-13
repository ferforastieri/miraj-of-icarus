#!/usr/bin/env bash
set -euo pipefail

readonly XWIN_VERSION="0.9.0"
readonly XWIN_ARCHIVE="xwin-${XWIN_VERSION}-x86_64-unknown-linux-musl.tar.gz"
readonly XWIN_URL="https://github.com/Jake-Shadle/xwin/releases/download/${XWIN_VERSION}/${XWIN_ARCHIVE}"
readonly XWIN_SHA256="31e1033f30608ba6b821d17f1461042bd54c23424813c9b4e9ae15b6d32fa4cd"
readonly WINDOWS_SDK_VERSION="10.0.26100"
readonly WINDOWS_CRT_VERSION="14.44.17.14"

if (( $# != 2 )); then
  echo "usage: $0 OUTPUT_DIRECTORY CACHE_DIRECTORY" >&2
  exit 2
fi

readonly output_directory="$1"
readonly cache_directory="$2"

if [[ "$output_directory" != /* || "$cache_directory" != /* ]]; then
  echo "output and cache directories must be absolute paths" >&2
  exit 2
fi

working_directory="$(mktemp -d)"
trap 'rm -rf -- "$working_directory"' EXIT

archive_path="${working_directory}/${XWIN_ARCHIVE}"
curl --fail --location --retry 3 --output "$archive_path" "$XWIN_URL"
printf '%s  %s\n' "$XWIN_SHA256" "$archive_path" | sha256sum --check --status
tar --extract --gzip --file "$archive_path" --directory "$working_directory"

xwin_binary="${working_directory}/xwin-${XWIN_VERSION}-x86_64-unknown-linux-musl/xwin"
test -x "$xwin_binary"

mkdir -p -- "$cache_directory"
"$xwin_binary" \
  --accept-license \
  --sdk-version "$WINDOWS_SDK_VERSION" \
  --crt-version "$WINDOWS_CRT_VERSION" \
  --cache-dir "$cache_directory" \
  splat \
  --preserve-ms-arch-notation \
  --output "$output_directory"

# lld-link resolves the canonical Windows import name case-sensitively on Linux.
# xwin 0.9.0 emits HID.lib and hid.lib, while Wicked links Hid.lib.
ln -sfn HID.lib "${output_directory}/sdk/lib/um/x64/Hid.lib"

test -f "${output_directory}/crt/include/vcruntime.h"
test -f "${output_directory}/crt/lib/x64/libcmt.lib"
test -f "${output_directory}/sdk/Include/${WINDOWS_SDK_VERSION}/um/Windows.h"
test -f "${output_directory}/sdk/Lib/${WINDOWS_SDK_VERSION}/um/x64/user32.lib"
test -f "${output_directory}/sdk/Lib/${WINDOWS_SDK_VERSION}/um/x64/Hid.lib"
