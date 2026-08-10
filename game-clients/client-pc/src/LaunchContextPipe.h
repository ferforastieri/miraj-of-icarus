#pragma once

#include "masicarus/client/LaunchContext.h"

namespace masicarus::game
{
[[nodiscard]] masicarus::client::LaunchContext ReadLaunchContext(const wchar_t* commandLine);
}
