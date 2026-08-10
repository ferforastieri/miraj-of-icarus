#pragma once

#include <cstdint>
#include <functional>
#include <string>

namespace masicarus::launcher
{
enum class UpdateAction
{
    Ready,
    Installed,
    Updated,
    Repaired,
};

struct UpdateProgress
{
    std::wstring status;
    std::wstring detail;
    std::uint64_t completed = 0;
    std::uint64_t total = 0;
};

struct UpdateResult
{
    UpdateAction action = UpdateAction::Ready;
    std::string version;
    std::uint64_t downloadedBytes = 0;
};

using UpdateProgressCallback = std::function<void(const UpdateProgress&)>;

[[nodiscard]] UpdateResult EnsureClientReady(
    const std::string& apiEndpoint,
    const std::wstring& installDirectory,
    const UpdateProgressCallback& progress = {});
}
