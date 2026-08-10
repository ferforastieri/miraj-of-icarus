#include "LaunchContextPipe.h"

#include <windows.h>

#include <array>
#include <cerrno>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>

namespace masicarus::game
{
namespace
{
struct HandleCloser
{
    void operator()(void* handle) const
    {
        if (handle != nullptr && handle != INVALID_HANDLE_VALUE) CloseHandle(handle);
    }
};
using Handle = std::unique_ptr<void, HandleCloser>;
}

masicarus::client::LaunchContext ReadLaunchContext(const wchar_t* commandLine)
{
    const std::wstring arguments(commandLine == nullptr ? L"" : commandLine);
    constexpr auto Prefix = L"--launch-context-handle=";
    const auto position = arguments.find(Prefix);
    if (position == std::wstring::npos)
    {
        throw std::runtime_error("The game must be started by the MASICARUS launcher.");
    }
    const auto value = arguments.substr(position + std::wstring_view(Prefix).size());
    wchar_t* end = nullptr;
    errno = 0;
    const auto numeric = std::wcstoull(value.c_str(), &end, 10);
    if (errno != 0 || end == value.c_str() || (*end != L'\0' && *end != L' '))
    {
        throw std::runtime_error("The launcher IPC handle is invalid.");
    }
    Handle pipe(reinterpret_cast<HANDLE>(static_cast<std::uintptr_t>(numeric)));
    std::string payload;
    std::array<char, 4096> buffer{};
    for (;;)
    {
        DWORD received = 0;
        if (!ReadFile(pipe.get(), buffer.data(), static_cast<DWORD>(buffer.size()), &received, nullptr))
        {
            if (GetLastError() == ERROR_BROKEN_PIPE) break;
            throw std::runtime_error("Unable to read the launcher context.");
        }
        if (received == 0) break;
        payload.append(buffer.data(), received);
        if (payload.size() > 65536) throw std::runtime_error("The launcher context is too large.");
    }
    return masicarus::client::LaunchContext::Deserialize(payload);
}
}
