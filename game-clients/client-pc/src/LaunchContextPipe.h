#pragma once

#include "miraj_of_icarus/client/LaunchContext.h"

namespace miraj_of_icarus::game
{
[[nodiscard]] miraj_of_icarus::client::LaunchContext ReadLaunchContext(const wchar_t* commandLine);
}
