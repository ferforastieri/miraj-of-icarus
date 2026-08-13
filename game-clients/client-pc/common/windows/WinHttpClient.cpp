#include "miraj_of_icarus/client/windows/WinHttpClient.h"

#include <windows.h>
#include <winhttp.h>

#include <cerrno>
#include <algorithm>
#include <cstdint>
#include <memory>
#include <stdexcept>
#include <vector>

namespace miraj_of_icarus::client::windows
{
namespace
{
constexpr std::size_t MaximumResponseSize = 4 * 1024 * 1024;
thread_local int RateLimitRetries = 0;

struct Closer
{
    void operator()(void* handle) const
    {
        if (handle != nullptr) WinHttpCloseHandle(handle);
    }
};
using Handle = std::unique_ptr<void, Closer>;

struct FileCloser
{
    void operator()(void* handle) const
    {
        if (handle != nullptr && handle != INVALID_HANDLE_VALUE) CloseHandle(handle);
    }
};
using FileHandle = std::unique_ptr<void, FileCloser>;

void Require(bool condition, const char* message)
{
    if (!condition) throw std::runtime_error(message);
}

DWORD RetryAfterMilliseconds(void* request)
{
    wchar_t value[32]{};
    DWORD size = sizeof(value);
    if (!WinHttpQueryHeaders(request, WINHTTP_QUERY_CUSTOM, L"Retry-After", value, &size,
            WINHTTP_NO_HEADER_INDEX)) return 1000;
    wchar_t* end = nullptr;
    const auto seconds = wcstoul(value, &end, 10);
    return end != value && *end == L'\0'
        ? static_cast<DWORD>(std::clamp<unsigned long>(seconds, 1, 60) * 1000)
        : 1000;
}

}

std::string EncodeUrlPath(std::string_view path)
{
    constexpr char Hex[] = "0123456789ABCDEF";
    std::string result;
    result.reserve(path.size());
    for (const unsigned char character : path)
    {
        if ((character >= 'a' && character <= 'z') ||
            (character >= 'A' && character <= 'Z') ||
            (character >= '0' && character <= '9') ||
            character == '-' || character == '_' || character == '.' || character == '~' ||
            character == '/')
        {
            result.push_back(static_cast<char>(character));
        }
        else
        {
            result.push_back('%');
            result.push_back(Hex[character >> 4]);
            result.push_back(Hex[character & 0x0f]);
        }
    }
    return result;
}

std::string JoinEndpoint(const std::string& base, std::string_view path)
{
    if (path.starts_with("https://") || path.starts_with("http://"))
    {
        return std::string(path);
    }

    return base.ends_with('/')
        ? base.substr(0, base.size() - 1) + std::string(path)
        : base + std::string(path);
}

std::string RequestJson(
    const std::string& method,
    const std::string& url,
    const std::string& body,
    const std::string& bearer)
{
    const auto wideUrl = ToWide(url);
    URL_COMPONENTSW parts{};
    parts.dwStructSize = sizeof(parts);
    parts.dwSchemeLength = parts.dwHostNameLength = parts.dwUrlPathLength =
        parts.dwExtraInfoLength = DWORD(-1);
    Require(WinHttpCrackUrl(wideUrl.c_str(), 0, 0, &parts) != FALSE,
        "Invalid service URL.");
    Require(parts.nScheme == INTERNET_SCHEME_HTTP || parts.nScheme == INTERNET_SCHEME_HTTPS,
        "Service URL must use HTTP or HTTPS.");

    Handle session(WinHttpOpen(L"Miraj of Icarus/0.1", WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY,
        WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0));
    Require(session != nullptr, "Unable to initialize WinHTTP.");
    WinHttpSetTimeouts(session.get(), 5000, 5000, 5000, 10000);

    const std::wstring host(parts.lpszHostName, parts.dwHostNameLength);
    Handle connection(WinHttpConnect(session.get(), host.c_str(), parts.nPort, 0));
    Require(connection != nullptr, "Unable to connect to the service.");

    std::wstring path(parts.lpszUrlPath, parts.dwUrlPathLength);
    path.append(parts.lpszExtraInfo, parts.dwExtraInfoLength);
    const auto verb = ToWide(method);
    Handle request(WinHttpOpenRequest(connection.get(), verb.c_str(), path.c_str(), nullptr,
        WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES,
        parts.nScheme == INTERNET_SCHEME_HTTPS ? WINHTTP_FLAG_SECURE : 0));
    Require(request != nullptr, "Unable to create the service request.");

    std::wstring headers = L"Accept: application/json\r\n";
    if (!body.empty()) headers += L"Content-Type: application/json\r\n";
    if (!bearer.empty()) headers += L"Authorization: Bearer " + ToWide(bearer) + L"\r\n";
    auto* data = body.empty() ? WINHTTP_NO_REQUEST_DATA : const_cast<char*>(body.data());
    Require(WinHttpSendRequest(request.get(), headers.c_str(), DWORD(headers.size()), data,
                DWORD(body.size()), DWORD(body.size()), 0) != FALSE &&
            WinHttpReceiveResponse(request.get(), nullptr) != FALSE,
        "The service did not respond.");

    DWORD status = 0;
    DWORD statusSize = sizeof(status);
    Require(WinHttpQueryHeaders(request.get(),
                WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
                WINHTTP_HEADER_NAME_BY_INDEX, &status, &statusSize,
                WINHTTP_NO_HEADER_INDEX) != FALSE,
        "The service returned an invalid response.");

    if (status == 429 && RateLimitRetries < 3)
    {
        const auto delay = RetryAfterMilliseconds(request.get());
        ++RateLimitRetries;
        Sleep(delay);
        try
        {
            auto result = RequestJson(method, url, body, bearer);
            --RateLimitRetries;
            return result;
        }
        catch (...)
        {
            --RateLimitRetries;
            throw;
        }
    }

    std::string response;
    for (;;)
    {
        DWORD available = 0;
        Require(WinHttpQueryDataAvailable(request.get(), &available) != FALSE,
            "Unable to read the service response.");
        if (available == 0) break;
        if (response.size() + available > MaximumResponseSize)
        {
            throw std::runtime_error("The service response is too large.");
        }
        const auto offset = response.size();
        response.resize(offset + available);
        DWORD received = 0;
        Require(WinHttpReadData(request.get(), response.data() + offset, available,
                    &received) != FALSE,
            "Unable to read the service response.");
        response.resize(offset + received);
    }
    if (status < 200 || status >= 300)
    {
        throw std::runtime_error("Service returned HTTP " + std::to_string(status) + ".");
    }
    return response;
}

void DownloadFile(const std::string& url, const std::wstring& destination,
    const DownloadProgress& progress, const std::string& bearer)
{
    const auto wideUrl = ToWide(url);
    URL_COMPONENTSW parts{};
    parts.dwStructSize = sizeof(parts);
    parts.dwSchemeLength = parts.dwHostNameLength = parts.dwUrlPathLength =
        parts.dwExtraInfoLength = DWORD(-1);
    Require(WinHttpCrackUrl(wideUrl.c_str(), 0, 0, &parts) != FALSE,
        "Invalid download URL.");
    Require(parts.nScheme == INTERNET_SCHEME_HTTP || parts.nScheme == INTERNET_SCHEME_HTTPS,
        "Download URL must use HTTP or HTTPS.");

    Handle session(WinHttpOpen(L"Miraj of Icarus Launcher/0.1", WINHTTP_ACCESS_TYPE_AUTOMATIC_PROXY,
        WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0));
    Require(session != nullptr, "Unable to initialize the download.");
    WinHttpSetTimeouts(session.get(), 5000, 5000, 10000, 30000);

    const std::wstring host(parts.lpszHostName, parts.dwHostNameLength);
    Handle connection(WinHttpConnect(session.get(), host.c_str(), parts.nPort, 0));
    Require(connection != nullptr, "Unable to connect to the download service.");
    std::wstring path(parts.lpszUrlPath, parts.dwUrlPathLength);
    path.append(parts.lpszExtraInfo, parts.dwExtraInfoLength);
    Handle request(WinHttpOpenRequest(connection.get(), L"GET", path.c_str(), nullptr,
        WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES,
        parts.nScheme == INTERNET_SCHEME_HTTPS ? WINHTTP_FLAG_SECURE : 0));
    Require(request != nullptr, "Unable to create the download request.");
    const auto headers = bearer.empty()
        ? std::wstring{}
        : L"Authorization: Bearer " + ToWide(bearer) + L"\r\n";
    Require(WinHttpSendRequest(request.get(),
                headers.empty() ? WINHTTP_NO_ADDITIONAL_HEADERS : headers.c_str(),
                static_cast<DWORD>(headers.size()),
                WINHTTP_NO_REQUEST_DATA, 0, 0, 0) != FALSE &&
            WinHttpReceiveResponse(request.get(), nullptr) != FALSE,
        "The download service did not respond.");

    DWORD status = 0;
    DWORD statusSize = sizeof(status);
    Require(WinHttpQueryHeaders(request.get(),
                WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
                WINHTTP_HEADER_NAME_BY_INDEX, &status, &statusSize,
                WINHTTP_NO_HEADER_INDEX) != FALSE,
        "The download service returned an invalid response.");
    if (status == 429 && RateLimitRetries < 3)
    {
        const auto delay = RetryAfterMilliseconds(request.get());
        ++RateLimitRetries;
        Sleep(delay);
        try
        {
            DownloadFile(url, destination, progress, bearer);
            --RateLimitRetries;
            return;
        }
        catch (...)
        {
            --RateLimitRetries;
            throw;
        }
    }
    Require(status >= 200 && status < 300,
        "The download service rejected the file request.");

    wchar_t lengthBuffer[32]{};
    DWORD lengthSize = sizeof(lengthBuffer);
    Require(WinHttpQueryHeaders(request.get(), WINHTTP_QUERY_CONTENT_LENGTH,
                WINHTTP_HEADER_NAME_BY_INDEX, lengthBuffer, &lengthSize,
                WINHTTP_NO_HEADER_INDEX) != FALSE,
        "The download response does not include a file size.");
    wchar_t* lengthEnd = nullptr;
    errno = 0;
    const auto total = _wcstoui64(lengthBuffer, &lengthEnd, 10);
    Require(errno != ERANGE && lengthEnd != lengthBuffer && *lengthEnd == L'\0',
        "The download response has an invalid file size.");

    FileHandle file(CreateFileW(destination.c_str(), GENERIC_WRITE, 0, nullptr, CREATE_ALWAYS,
        FILE_ATTRIBUTE_NORMAL | FILE_FLAG_SEQUENTIAL_SCAN, nullptr));
    Require(file != nullptr && file.get() != INVALID_HANDLE_VALUE,
        "Unable to create the downloaded file.");

    std::vector<std::uint8_t> buffer(1024 * 1024);
    std::uint64_t receivedTotal = 0;
    for (;;)
    {
        DWORD received = 0;
        Require(WinHttpReadData(request.get(), buffer.data(), static_cast<DWORD>(buffer.size()),
                    &received) != FALSE,
            "The download was interrupted.");
        if (received == 0) break;
        DWORD written = 0;
        Require(WriteFile(file.get(), buffer.data(), received, &written, nullptr) != FALSE &&
                written == received,
            "Unable to save the downloaded file.");
        receivedTotal += received;
        Require(receivedTotal <= total, "The download exceeded its declared size.");
        if (progress) progress(receivedTotal, total);
    }
    Require(receivedTotal == total, "The downloaded file is incomplete.");
    Require(FlushFileBuffers(file.get()) != FALSE, "Unable to finalize the downloaded file.");
}

std::string ToUtf8(const std::wstring& value)
{
    if (value.empty()) return {};
    const int size = WideCharToMultiByte(CP_UTF8, WC_ERR_INVALID_CHARS, value.data(),
        int(value.size()), nullptr, 0, nullptr, nullptr);
    Require(size > 0, "Text is not valid Unicode.");
    std::string result(static_cast<std::size_t>(size), '\0');
    Require(WideCharToMultiByte(CP_UTF8, WC_ERR_INVALID_CHARS, value.data(),
                int(value.size()), result.data(), size, nullptr, nullptr) == size,
        "Unable to encode text as UTF-8.");
    return result;
}

std::wstring ToWide(const std::string& value)
{
    if (value.empty()) return {};
    const int size = MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, value.data(),
        int(value.size()), nullptr, 0);
    Require(size > 0, "Text is not valid UTF-8.");
    std::wstring result(static_cast<std::size_t>(size), L'\0');
    Require(MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, value.data(),
                int(value.size()), result.data(), size) == size,
        "Unable to decode UTF-8 text.");
    return result;
}
}
