#!/usr/bin/env python3
"""Sign a client release manifest with the CI-provided private key."""

from __future__ import annotations

import base64
import binascii
import os
import pathlib
import subprocess
import sys
import tempfile


PRIVATE_KEY_ENV = "MIRAJ_OF_ICARUS_RELEASE_SIGNING_KEY_BASE64"


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} RELEASE_DIRECTORY", file=sys.stderr)
        return 2

    root = pathlib.Path(sys.argv[1]).resolve(strict=True)
    manifest = root / "release-manifest.json"
    if not manifest.is_file():
        print("release manifest is missing", file=sys.stderr)
        return 1

    encoded_key = os.environ.get(PRIVATE_KEY_ENV, "")
    try:
        private_key = base64.b64decode(encoded_key, validate=True)
    except (binascii.Error, ValueError):
        private_key = b""
    if not private_key.startswith(b"-----BEGIN PRIVATE KEY-----"):
        print(f"{PRIVATE_KEY_ENV} is missing or invalid", file=sys.stderr)
        return 1

    signature = root / "release-manifest.sig"
    temporary_signature = root / "release-manifest.sig.tmp"
    with tempfile.TemporaryDirectory(prefix="miraj-of-icarus-release-signing-") as temporary:
        key_path = pathlib.Path(temporary) / "private.pem"
        key_path.write_bytes(private_key)
        key_path.chmod(0o600)
        try:
            subprocess.run(
                [
                    "openssl",
                    "dgst",
                    "-sha256",
                    "-sign",
                    str(key_path),
                    "-out",
                    str(temporary_signature),
                    str(manifest),
                ],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.PIPE,
            )
        except (FileNotFoundError, subprocess.CalledProcessError):
            temporary_signature.unlink(missing_ok=True)
            print("unable to sign release manifest", file=sys.stderr)
            return 1

    temporary_signature.replace(signature)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
