#include "GameProcess.h"

#include <windows.h>

#include <cstddef>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

namespace masicarus::launcher
{
namespace
{
struct HandleCloser
{
    void operator()(void* handle) const
    {
        if (handle != nullptr && handle != INVALID_HANDLE_VALUE)
        {
            CloseHandle(handle);
        }
    }
};
using Handle = std::unique_ptr<void, HandleCloser>;

[[noreturn]] void ThrowWindowsError(const char* operation)
{
    throw std::runtime_error(std::string(operation) + " failed with Windows error " +
        std::to_string(GetLastError()) + ".");
}
}

std::wstring ExecutableDirectory()
{
    std::wstring path(32768, L'\0');
    const auto length = GetModuleFileNameW(nullptr, path.data(), static_cast<DWORD>(path.size()));
    if (length == 0 || length >= path.size())
    {
        ThrowWindowsError("GetModuleFileNameW");
    }
    path.resize(length);
    const auto separator = path.find_last_of(L"\\/");
    return separator == std::wstring::npos ? std::wstring{} : path.substr(0, separator);
}

std::wstring SiblingExecutable(const wchar_t* fileName)
{
    auto path = ExecutableDirectory();
    if (!path.empty()) path += L'\\';
    return path + fileName;
}

std::wstring GameInstallDirectory()
{
    std::wstring localAppData(32768, L'\0');
    const auto length = GetEnvironmentVariableW(
        L"LOCALAPPDATA", localAppData.data(), static_cast<DWORD>(localAppData.size()));
    if (length == 0 || length >= localAppData.size())
    {
        ThrowWindowsError("GetEnvironmentVariableW(LOCALAPPDATA)");
    }
    localAppData.resize(length);
    return localAppData + L"\\Masicarus\\Game";
}

void LaunchGame(const std::wstring& executable, const masicarus::client::LaunchContext& context)
{
    SECURITY_ATTRIBUTES security{sizeof(security), nullptr, TRUE};
    HANDLE rawRead = nullptr;
    HANDLE rawWrite = nullptr;
    if (!CreatePipe(&rawRead, &rawWrite, &security, 0))
    {
        ThrowWindowsError("CreatePipe");
    }
    Handle read(rawRead);
    Handle write(rawWrite);
    if (!SetHandleInformation(write.get(), HANDLE_FLAG_INHERIT, 0))
    {
        ThrowWindowsError("SetHandleInformation");
    }

    SIZE_T attributeSize = 0;
    InitializeProcThreadAttributeList(nullptr, 1, 0, &attributeSize);
    std::vector<std::byte> storage(attributeSize);
    auto* attributes = reinterpret_cast<PPROC_THREAD_ATTRIBUTE_LIST>(storage.data());
    if (!InitializeProcThreadAttributeList(attributes, 1, 0, &attributeSize))
    {
        ThrowWindowsError("InitializeProcThreadAttributeList");
    }
    struct AttributeGuard
    {
        PPROC_THREAD_ATTRIBUTE_LIST value;
        ~AttributeGuard() { DeleteProcThreadAttributeList(value); }
    } guard{attributes};
    HANDLE inherited = read.get();
    if (!UpdateProcThreadAttribute(attributes, 0, PROC_THREAD_ATTRIBUTE_HANDLE_LIST,
            &inherited, sizeof(inherited), nullptr, nullptr))
    {
        ThrowWindowsError("UpdateProcThreadAttribute");
    }

    STARTUPINFOEXW startup{};
    startup.StartupInfo.cb = sizeof(startup);
    startup.lpAttributeList = attributes;
    auto command = L"\"" + executable + L"\" --launch-context-handle=" +
        std::to_wstring(reinterpret_cast<std::uintptr_t>(read.get()));
    std::vector<wchar_t> mutableCommand(command.begin(), command.end());
    mutableCommand.push_back(L'\0');
    const auto separator = executable.find_last_of(L"\\/");
    const auto workingDirectory = separator == std::wstring::npos
        ? std::wstring{} : executable.substr(0, separator);
    PROCESS_INFORMATION process{};
    if (!CreateProcessW(executable.c_str(), mutableCommand.data(), nullptr, nullptr, TRUE,
            EXTENDED_STARTUPINFO_PRESENT, nullptr,
            workingDirectory.empty() ? nullptr : workingDirectory.c_str(),
            &startup.StartupInfo, &process))
    {
        ThrowWindowsError("CreateProcessW");
    }
    Handle processHandle(process.hProcess);
    Handle threadHandle(process.hThread);
    read.reset();

    const auto payload = context.Serialize();
    DWORD written = 0;
    if (!WriteFile(write.get(), payload.data(), static_cast<DWORD>(payload.size()), &written, nullptr) ||
        written != payload.size())
    {
        TerminateProcess(processHandle.get(), 2);
        ThrowWindowsError("WriteFile");
    }
}
}
