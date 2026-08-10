#!/usr/bin/env python3
"""Create the deterministic file inventory consumed by the signed release layer."""

from __future__ import annotations

import hashlib
import json
import pathlib
import sys


def digest(path: pathlib.Path) -> str:
    value = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            value.update(chunk)
    return value.hexdigest()


def main() -> int:
    if len(sys.argv) != 2:
        print(f"usage: {sys.argv[0]} RELEASE_DIRECTORY", file=sys.stderr)
        return 2

    root = pathlib.Path(sys.argv[1]).resolve(strict=True)
    manifest_path = root / "release-manifest.json"
    excluded = {manifest_path, root / "release-manifest.sig", root / "release-manifest.sig.tmp"}
    files = []
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"release contains a symbolic link: {path.relative_to(root)}")
        if path.is_file() and path not in excluded:
            files.append(
                {
                    "path": path.relative_to(root).as_posix(),
                    "sha256": digest(path),
                    "size": path.stat().st_size,
                }
            )

    document = {
        "schemaVersion": 1,
        "platform": "windows-x86_64",
        "files": files,
    }
    manifest_path.write_text(
        json.dumps(document, ensure_ascii=False, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
        newline="\n",
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
