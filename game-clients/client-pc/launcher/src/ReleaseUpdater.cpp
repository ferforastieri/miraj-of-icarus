#include "ReleaseUpdater.h"

#include "ReleaseIntegrity.h"
#include "miraj_of_icarus/client/windows/WinHttpClient.h"

#include <windows.h>
#include <nlohmann/json.hpp>

#include <algorithm>
#include <cctype>
#include <filesystem>
#include <fstream>
#include <stdexcept>
#include <string>
#include <system_error>

namespace miraj_of_icarus::launcher
{
namespace
{
using miraj_of_icarus::client::windows::DownloadFile;
using miraj_of_icarus::client::windows::EncodeUrlPath;
using miraj_of_icarus::client::windows::JoinEndpoint;
using miraj_of_icarus::client::windows::RequestJson;
using miraj_of_icarus::client::windows::ToWide;

struct PublishedRelease
{
    std::string version;
    std::uint64_t totalSize = 0;
    std::string manifestUrl;
    std::string signatureUrl;
    std::string filesBaseUrl;
};

[[noreturn]] void Fail(const std::string& message)
{
    throw std::runtime_error(message);
}

void Report(const UpdateProgressCallback& callback, std::wstring status,
    std::wstring detail, std::uint64_t completed, std::uint64_t total)
{
    if (callback) callback({std::move(status), std::move(detail), completed, total});
}

PublishedRelease ParsePublishedRelease(const nlohmann::json& document)
{
    PublishedRelease result{
        .version = document.at("version").get<std::string>(),
        .totalSize = document.at("totalSize").get<std::uint64_t>(),
        .manifestUrl = document.at("manifestUrl").get<std::string>(),
        .signatureUrl = document.at("signatureUrl").get<std::string>(),
        .filesBaseUrl = document.at("filesBaseUrl").get<std::string>(),
    };
    if (result.version.size() != 40 || result.totalSize == 0 ||
        !std::ranges::all_of(result.version, [](const unsigned char character)
        {
            return std::isdigit(character) != 0 || (character >= 'a' && character <= 'f');
        }))
    {
        Fail("Published client release metadata is invalid.");
    }
    return result;
}

void WriteBinary(const std::filesystem::path& path, const std::string& payload)
{
    std::ofstream output(path, std::ios::binary | std::ios::trunc);
    if (!output || !output.write(payload.data(), static_cast<std::streamsize>(payload.size())) ||
        !output.flush())
    {
        Fail("Unable to save release metadata.");
    }
}

std::string ReadVersion(const std::filesystem::path& root)
{
    std::ifstream input(root / "release-version.txt", std::ios::binary);
    std::string version;
    std::getline(input, version);
    return version;
}

void RemoveDirectory(const std::filesystem::path& path)
{
    std::error_code error;
    std::filesystem::remove_all(path, error);
    if (error) Fail("Unable to clear the update staging directory.");
}

void CreateDirectories(const std::filesystem::path& path)
{
    std::error_code error;
    std::filesystem::create_directories(path, error);
    if (error) Fail("Unable to create the game installation directory.");
}

bool IsDirectory(const std::filesystem::path& path)
{
    std::error_code error;
    const auto result = std::filesystem::is_directory(path, error);
    return !error && result;
}

void Activate(const std::filesystem::path& active, const std::filesystem::path& staging)
{
    const auto rollback = active.parent_path() / L"Game.rollback";
    RemoveDirectory(rollback);
    const bool hadActive = IsDirectory(active);
    std::error_code error;
    if (hadActive)
    {
        std::filesystem::rename(active, rollback, error);
        if (error) Fail("Close the game before installing the update.");
    }
    std::filesystem::rename(staging, active, error);
    if (error)
    {
        if (hadActive)
        {
            std::error_code restoreError;
            std::filesystem::rename(rollback, active, restoreError);
        }
        Fail("Unable to activate the downloaded client release.");
    }

    try
    {
        VerifyInstalledRelease(active.wstring());
    }
    catch (...)
    {
        RemoveDirectory(active);
        if (hadActive)
        {
            std::error_code restoreError;
            std::filesystem::rename(rollback, active, restoreError);
        }
        throw;
    }
}
}

UpdateResult EnsureClientReady(const std::string& apiEndpoint,
    const std::wstring& installDirectory, const AccessTokenProvider& accessTokenProvider,
    const UpdateProgressCallback& progress)
{
    const std::filesystem::path active(installDirectory);
    const auto parent = active.parent_path();
    const auto staging = parent / L"Game.staging";
    CreateDirectories(parent);

    Report(progress, L"CONSULTANDO O REINO", L"Procurando a versão mais recente", 0, 1);
    auto authorization = nlohmann::json::parse(RequestJson("POST",
        JoinEndpoint(apiEndpoint, "/v1/client-releases/windows/download-session"), "{}",
        accessTokenProvider()));
    auto downloadToken = authorization.at("accessToken").get<std::string>();
    auto published = ParsePublishedRelease(authorization);
    auto authorizationIssuedAt = GetTickCount64();
    const auto renewDownloadAuthorization = [&]
    {
        constexpr ULONGLONG RenewalInterval = 10ULL * 60ULL * 1000ULL;
        if (GetTickCount64() - authorizationIssuedAt < RenewalInterval) return;
        authorization = nlohmann::json::parse(RequestJson("POST",
            JoinEndpoint(apiEndpoint, "/v1/client-releases/windows/download-session"), "{}",
            accessTokenProvider()));
        auto renewed = ParsePublishedRelease(authorization);
        if (renewed.version != published.version)
            Fail("The published release changed while the client was being installed.");
        downloadToken = authorization.at("accessToken").get<std::string>();
        published = std::move(renewed);
        authorizationIssuedAt = GetTickCount64();
    };
    const auto installedVersion = ReadVersion(active);
    if (installedVersion == published.version)
    {
        try
        {
            VerifyInstalledRelease(active.wstring());
            Report(progress, L"CLIENTE ATUALIZADO", L"Todos os arquivos estão prontos", 1, 1);
            return {.action = UpdateAction::Ready, .version = published.version};
        }
        catch (const std::exception&)
        {
            // The signed release below will repair only the affected files.
        }
    }

    const auto action = !IsDirectory(active) ? UpdateAction::Installed
        : installedVersion == published.version ? UpdateAction::Repaired
                                                : UpdateAction::Updated;
    RemoveDirectory(staging);
    CreateDirectories(staging);

    Report(progress, L"VALIDANDO ATUALIZAÇÃO", L"Conferindo a assinatura da release", 0,
        published.totalSize);
    WriteBinary(staging / "release-manifest.json",
        RequestJson("GET", published.manifestUrl, {}, downloadToken));
    WriteBinary(staging / "release-manifest.sig",
        RequestJson("GET", published.signatureUrl, {}, downloadToken));
    const auto manifest = ReadVerifiedReleaseManifest(staging.wstring());
    std::uint64_t manifestTotal = 0;
    for (const auto& file : manifest.files) manifestTotal += file.size;
    if (manifestTotal != published.totalSize)
    {
        RemoveDirectory(staging);
        Fail("Published client release size does not match its signed manifest.");
    }

    std::uint64_t completed = 0;
    std::uint64_t downloaded = 0;
    for (const auto& expected : manifest.files)
    {
        renewDownloadAuthorization();
        const auto destination = staging / ToWide(expected.path);
        CreateDirectories(destination.parent_path());
        if (IsReleaseFileValid(active.wstring(), expected))
        {
            if (!CopyFileW((active / ToWide(expected.path)).c_str(), destination.c_str(), TRUE))
            {
                RemoveDirectory(staging);
                Fail("Unable to reuse an existing game file.");
            }
            completed += expected.size;
            Report(progress, L"PREPARANDO ARQUIVOS", ToWide(expected.path), completed,
                manifestTotal);
            continue;
        }

        bool valid = false;
        for (int attempt = 0; attempt < 3 && !valid; ++attempt)
        {
            const auto url = published.filesBaseUrl + EncodeUrlPath(expected.path);
            try
            {
                DownloadFile(url, destination.wstring(), [&](const std::uint64_t received,
                    const std::uint64_t)
                {
                    Report(progress, L"BAIXANDO ATUALIZAÇÃO", ToWide(expected.path),
                        completed + received, manifestTotal);
                }, downloadToken);
                valid = IsReleaseFileValid(staging.wstring(), expected);
            }
            catch (const std::exception&)
            {
                valid = false;
            }
            if (!valid) DeleteFileW(destination.c_str());
        }
        if (!valid)
        {
            RemoveDirectory(staging);
            Fail("Unable to download a valid copy of " + expected.path + ".");
        }
        completed += expected.size;
        downloaded += expected.size;
    }

    Report(progress, L"ABRINDO A PASSAGEM", L"Ativando a release verificada", manifestTotal,
        manifestTotal);
    VerifyInstalledRelease(staging.wstring());
    Activate(active, staging);
    Report(progress, L"CLIENTE PRONTO", L"A instalação foi concluída", manifestTotal,
        manifestTotal);
    return {.action = action, .version = published.version, .downloadedBytes = downloaded};
}
}
