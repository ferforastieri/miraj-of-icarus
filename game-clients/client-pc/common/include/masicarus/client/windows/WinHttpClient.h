#pragma once

#include <string>
#include <string_view>
#include <cstdint>
#include <functional>

namespace masicarus::client::windows
{
[[nodiscard]] std::string JoinEndpoint(const std::string& base, std::string_view path);
[[nodiscard]] std::string RequestJson(
    const std::string& method,
    const std::string& url,
    const std::string& body = {},
    const std::string& bearer = {});
using DownloadProgress = std::function<void(std::uint64_t received, std::uint64_t total)>;
void DownloadFile(
    const std::string& url,
    const std::wstring& destination,
    const DownloadProgress& progress = {});
[[nodiscard]] std::string EncodeUrlPath(std::string_view path);
[[nodiscard]] std::string ToUtf8(const std::wstring& value);
[[nodiscard]] std::wstring ToWide(const std::string& value);
}
