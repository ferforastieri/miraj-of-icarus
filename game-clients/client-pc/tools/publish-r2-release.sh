#!/usr/bin/env bash
set -euo pipefail

if (( $# != 3 )); then
  echo "usage: $0 VERSION CLIENT_DIRECTORY LAUNCHER_ARCHIVE" >&2
  exit 2
fi

readonly version="$1"
readonly client_directory="$2"
readonly launcher_archive="$3"
readonly bucket="${MASICARUS_R2_BUCKET:-masicarus-releases}"
readonly public_base="${MASICARUS_DOWNLOAD_BASE_URL:-https://downloads.masicarus.com.br}"

[[ $version =~ ^[0-9a-f]{40}$ ]] || { echo "VERSION must be a full lowercase Git SHA" >&2; exit 2; }
for name in CLOUDFLARE_R2_ACCOUNT_ID AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY; do
  test -n "${!name:-}" || { echo "missing required environment variable: $name" >&2; exit 1; }
done
test -f "$client_directory/release-manifest.json"
test -f "$client_directory/release-manifest.sig"
test -f "$launcher_archive"
command -v aws >/dev/null
"$(dirname "$0")/verify-release-manifest.py" "$client_directory"

readonly endpoint="https://${CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com"
readonly release_prefix="releases/${version}"
readonly immutable_cache="public,max-age=31536000,immutable"

aws --endpoint-url "$endpoint" s3 sync \
  "$client_directory/" "s3://${bucket}/${release_prefix}/client/files/" \
  --exclude 'release-manifest.json' --exclude 'release-manifest.sig' \
  --cache-control "$immutable_cache" --only-show-errors
aws --endpoint-url "$endpoint" s3 cp "$client_directory/release-manifest.json" \
  "s3://${bucket}/${release_prefix}/client/release-manifest.json" \
  --content-type application/json --cache-control "$immutable_cache" --only-show-errors
aws --endpoint-url "$endpoint" s3 cp "$client_directory/release-manifest.sig" \
  "s3://${bucket}/${release_prefix}/client/release-manifest.sig" \
  --content-type application/octet-stream --cache-control "$immutable_cache" --only-show-errors
aws --endpoint-url "$endpoint" s3 cp "$launcher_archive" \
  "s3://${bucket}/${release_prefix}/launcher/MasicarusLauncher.zip" \
  --content-type application/zip --cache-control "$immutable_cache" --only-show-errors

aws --endpoint-url "$endpoint" s3api head-object \
  --bucket "$bucket" --key "${release_prefix}/client/release-manifest.json" >/dev/null
aws --endpoint-url "$endpoint" s3api head-object \
  --bucket "$bucket" --key "${release_prefix}/client/release-manifest.sig" >/dev/null
aws --endpoint-url "$endpoint" s3api head-object \
  --bucket "$bucket" --key "${release_prefix}/launcher/MasicarusLauncher.zip" >/dev/null
while IFS= read -r relative_path; do
  aws --endpoint-url "$endpoint" s3api head-object \
    --bucket "$bucket" --key "${release_prefix}/client/files/${relative_path}" >/dev/null
done < <(python3 - "$client_directory/release-manifest.json" <<'PY'
import json
import pathlib
import sys

for item in json.loads(pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"))["files"]:
    print(item["path"])
PY
)

channel_file="$(mktemp)"
trap 'rm -f -- "$channel_file"' EXIT
python3 - "$version" "$client_directory/release-manifest.json" "$public_base" "$channel_file" <<'PY'
import datetime
import json
import pathlib
import sys

version, manifest_path, public_base, output_path = sys.argv[1:]
manifest = json.loads(pathlib.Path(manifest_path).read_text(encoding="utf-8"))
root = f"{public_base.rstrip('/')}/releases/{version}"
channel = {
    "version": version,
    "totalSize": sum(item["size"] for item in manifest["files"]),
    "manifestUrl": f"{root}/client/release-manifest.json",
    "signatureUrl": f"{root}/client/release-manifest.sig",
    "filesBaseUrl": f"{root}/client/files/",
    "launcherUrl": f"{root}/launcher/MasicarusLauncher.zip",
    "publishedAt": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
}
pathlib.Path(output_path).write_text(json.dumps(channel, indent=2) + "\n", encoding="utf-8")
PY

# The mutable channel is deliberately the final write: consumers never see a partial release.
aws --endpoint-url "$endpoint" s3 cp "$channel_file" "s3://${bucket}/channels/alpha.json" \
  --content-type application/json --cache-control 'public,max-age=60,must-revalidate' --only-show-errors
