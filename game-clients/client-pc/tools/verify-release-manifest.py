#!/usr/bin/env python3
"""Verify that a release directory exactly matches its signed file inventory."""

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
    document = json.loads(manifest_path.read_text(encoding="utf-8"))
    if document.get("schemaVersion") != 1 or document.get("platform") != "windows-x86_64":
        raise ValueError("release manifest header is invalid")

    expected: set[str] = set()
    for item in document.get("files", []):
        relative = pathlib.PurePosixPath(item["path"])
        if relative.is_absolute() or ".." in relative.parts or str(relative) in expected:
            raise ValueError(f"unsafe or duplicate release path: {relative}")
        expected.add(str(relative))
        path = root.joinpath(*relative.parts)
        if not path.is_file() or path.is_symlink():
            raise ValueError(f"release file is missing or unsafe: {relative}")
        if path.stat().st_size != item["size"] or digest(path) != item["sha256"]:
            raise ValueError(f"release file does not match its manifest: {relative}")

    excluded = {"release-manifest.json", "release-manifest.sig", "release-manifest.sig.tmp"}
    actual = {
        path.relative_to(root).as_posix()
        for path in root.rglob("*")
        if path.is_file() and path.relative_to(root).as_posix() not in excluded
    }
    if actual != expected:
        raise ValueError("release directory contains missing or unlisted files")
    if "MirajOfIcarusClient.exe" not in expected:
        raise ValueError("release manifest does not contain MirajOfIcarusClient.exe")
    print(f"verified {len(expected)} release files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
