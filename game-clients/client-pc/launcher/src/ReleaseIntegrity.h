#pragma once

#include "masicarus/client/ReleaseManifest.h"

#include <string>

namespace masicarus::launcher
{
void VerifyInstalledRelease(const std::wstring& releaseDirectory);
[[nodiscard]] masicarus::client::ReleaseManifest ReadVerifiedReleaseManifest(
    const std::wstring& releaseDirectory);
[[nodiscard]] bool IsReleaseFileValid(
    const std::wstring& releaseDirectory,
    const masicarus::client::ReleaseFile& expected);
}
