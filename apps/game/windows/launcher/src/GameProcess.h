#pragma once

#include "miraj_of_icarus/client/LaunchContext.h"

#include <string>

namespace miraj_of_icarus::launcher
{
[[nodiscard]] std::wstring ExecutableDirectory();
[[nodiscard]] std::wstring GameInstallDirectory();
[[nodiscard]] std::wstring SiblingExecutable(const wchar_t* fileName);
void LaunchGame(const std::wstring& executable, const miraj_of_icarus::client::LaunchContext& context);
}
