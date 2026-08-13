#!/usr/bin/env bash
set -euo pipefail

readonly tools_directory="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly temporary_directory="$(mktemp -d)"
trap 'rm -rf -- "$temporary_directory"' EXIT

mkdir -p "$temporary_directory/bin" "$temporary_directory/client"
printf 'client' > "$temporary_directory/client/MirajOfIcarusClient.exe"
printf 'launcher' > "$temporary_directory/MirajOfIcarusLauncher.exe"
"$tools_directory/create-release-manifest.py" "$temporary_directory/client"
printf 'signature' > "$temporary_directory/client/release-manifest.sig"

cat > "$temporary_directory/bin/aws" <<'MOCK'
#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' "$*" >> "$MIRAJ_OF_ICARUS_AWS_CALLS"
if [[ -n ${MIRAJ_OF_ICARUS_AWS_FAIL_ON:-} && " $* " == *" ${MIRAJ_OF_ICARUS_AWS_FAIL_ON} "* ]]; then
  exit 75
fi
MOCK
chmod 0755 "$temporary_directory/bin/aws"

export PATH="$temporary_directory/bin:$PATH"
export CLOUDFLARE_R2_ACCOUNT_ID=test-account
export AWS_ACCESS_KEY_ID=test-key
export AWS_SECRET_ACCESS_KEY=test-secret
export MIRAJ_OF_ICARUS_AWS_CALLS="$temporary_directory/aws-success.log"
readonly version=0123456789abcdef0123456789abcdef01234567

"$tools_directory/publish-r2-release.sh" \
  "$version" "$temporary_directory/client" "$temporary_directory/MirajOfIcarusLauncher.exe"

tail -n 1 "$MIRAJ_OF_ICARUS_AWS_CALLS" | grep -F 'channels/alpha.json' >/dev/null
grep -F 'public,max-age=31536000,immutable' "$MIRAJ_OF_ICARUS_AWS_CALLS" >/dev/null
tail -n 1 "$MIRAJ_OF_ICARUS_AWS_CALLS" | grep -F 'public,max-age=60,must-revalidate' >/dev/null

export MIRAJ_OF_ICARUS_AWS_CALLS="$temporary_directory/aws-failure.log"
export MIRAJ_OF_ICARUS_AWS_FAIL_ON="releases/${version}/client/release-manifest.sig"
if "$tools_directory/publish-r2-release.sh" \
  "$version" "$temporary_directory/client" "$temporary_directory/MirajOfIcarusLauncher.exe"; then
  echo "an interrupted upload unexpectedly succeeded" >&2
  exit 1
fi

if grep -F 'channels/alpha.json' "$MIRAJ_OF_ICARUS_AWS_CALLS" >/dev/null; then
  echo "the mutable channel was updated after an interrupted upload" >&2
  exit 1
fi

echo "R2 publication order and cache policy verified"
