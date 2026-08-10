#pragma once

#include "masicarus/client/LaunchContext.h"

#include <string>

namespace masicarus::launcher
{
[[nodiscard]] std::wstring ExecutableDirectory();
[[nodiscard]] std::wstring GameInstallDirectory();
[[nodiscard]] std::wstring SiblingExecutable(const wchar_t* fileName);
void LaunchGame(const std::wstring& executable, const masicarus::client::LaunchContext& context);
}
