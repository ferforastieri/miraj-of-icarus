#pragma once

#include "miraj_of_icarus/client/ReleaseManifest.h"

#include <string>

namespace miraj_of_icarus::launcher
{
void VerifyInstalledRelease(const std::wstring& releaseDirectory);
[[nodiscard]] miraj_of_icarus::client::ReleaseManifest ReadVerifiedReleaseManifest(
    const std::wstring& releaseDirectory);
[[nodiscard]] bool IsReleaseFileValid(
    const std::wstring& releaseDirectory,
    const miraj_of_icarus::client::ReleaseFile& expected);
}
