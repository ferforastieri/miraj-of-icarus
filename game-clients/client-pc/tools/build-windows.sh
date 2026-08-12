#!/usr/bin/env bash
set -euo pipefail

if (( $# != 4 )); then
  echo "usage: $0 XWIN_ROOT BUILD_DIRECTORY CLIENT_OUTPUT_DIRECTORY LAUNCHER_OUTPUT_DIRECTORY" >&2
  exit 2
fi

readonly xwin_root="$1"
readonly build_directory="$2"
readonly client_output_directory="$3"
readonly launcher_output_directory="$4"
readonly source_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly parallel_jobs="${MASICARUS_BUILD_JOBS:-4}"

for tool in cmake ninja clang-cl-20 lld-link-20 llvm-lib-20 llvm-rc-20 llvm-mt-20; do
  if ! command -v "$tool" >/dev/null; then
    echo "required build tool is unavailable: $tool" >&2
    exit 1
  fi
done

test -f "${xwin_root}/crt/include/vcruntime.h"
test -f "${xwin_root}/sdk/Include/10.0.26100/um/Windows.h"

cmake \
  -S "$source_directory" \
  -B "$build_directory" \
  -G Ninja \
  -DCMAKE_BUILD_TYPE=Release \
  -DCMAKE_TOOLCHAIN_FILE="${source_directory}/cmake/windows-msvc.cmake" \
  -DMASICARUS_XWIN_ROOT="$xwin_root" \
  -DMASICARUS_BUILD_TESTS=OFF \
  -DMASICARUS_BUILD_WINDOWS_APPS=ON

cmake --build "$build_directory" \
  --target MasicarusLauncher MasicarusClient \
  --parallel "$parallel_jobs"

rm -rf -- "$client_output_directory" "$launcher_output_directory"
mkdir -p -- "$client_output_directory" "$launcher_output_directory"

install -m 0755 "${build_directory}/src/MasicarusClient.exe" "$client_output_directory/"
install -m 0644 "${build_directory}/src/dxcompiler.dll" "$client_output_directory/"
cp -a "${build_directory}/src/shaders" "$client_output_directory/"
cmake -E copy_directory "${source_directory}/assets/lobby" "$client_output_directory/assets/lobby"

release_version="${MASICARUS_RELEASE_VERSION:-0000000000000000000000000000000000000000}"
[[ $release_version =~ ^[0-9a-f]{40}$ ]] || {
  echo "MASICARUS_RELEASE_VERSION must be a full lowercase Git SHA" >&2
  exit 1
}
printf '%s\n' "$release_version" > "$client_output_directory/release-version.txt"

install -m 0755 "${build_directory}/launcher/MasicarusLauncher.exe" "$launcher_output_directory/"
cmake -E copy_directory "${source_directory}/assets/launcher" "$launcher_output_directory/assets/launcher"
cmake -E copy_directory "${source_directory}/assets/global/branding" "$launcher_output_directory/assets/global/branding"

public_api_url="${MASICARUS_PUBLIC_API_URL:-http://localhost:8080}"
if [[ "$public_api_url" != https://* && "$public_api_url" != http://localhost:* && "$public_api_url" != http://127.0.0.1:* ]]; then
  echo "MASICARUS_PUBLIC_API_URL must use HTTPS (except localhost development URLs)" >&2
  exit 1
fi
python3 - "$public_api_url" "$launcher_output_directory/assets/launcher/config.json" <<'PY'
import json
import pathlib
import sys

destination = pathlib.Path(sys.argv[2])
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps({"apiEndpoint": sys.argv[1]}, separators=(",", ":")) + "\n")
PY

python3 "${source_directory}/tools/create-release-manifest.py" "$client_output_directory"
