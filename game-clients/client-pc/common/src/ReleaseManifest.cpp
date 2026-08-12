#include "miraj_of_icarus/client/ReleaseManifest.h"

#include <nlohmann/json.hpp>

#include <algorithm>
#include <cctype>
#include <stdexcept>
#include <string_view>
#include <unordered_set>

namespace miraj_of_icarus::client
{
namespace
{
bool IsSafeRelativePath(const std::string& value)
{
    if (value.empty() || value.size() > 512 || value.front() == '/' || value.back() == '/')
    {
        return false;
    }
    if (value.find('\\') != std::string::npos || value.find(':') != std::string::npos)
    {
        return false;
    }

    std::size_t start = 0;
    while (start < value.size())
    {
        const auto end = value.find('/', start);
        const auto part = std::string_view(value).substr(start,
            end == std::string::npos ? value.size() - start : end - start);
        if (part.empty() || part == "." || part == "..")
        {
            return false;
        }
        if (end == std::string::npos) break;
        start = end + 1;
    }
    return true;
}

bool IsSha256(const std::string& value)
{
    return value.size() == 64 && std::ranges::all_of(value, [](const unsigned char character)
    {
        return std::isdigit(character) != 0 || (character >= 'a' && character <= 'f');
    });
}
}

ReleaseManifest ReleaseManifest::Deserialize(const std::string& payload)
{
    const auto document = nlohmann::json::parse(payload);
    ReleaseManifest manifest{
        .schemaVersion = document.at("schemaVersion").get<int>(),
        .platform = document.at("platform").get<std::string>(),
        .files = {},
    };
    for (const auto& item : document.at("files"))
    {
        manifest.files.push_back({
            .path = item.at("path").get<std::string>(),
            .size = item.at("size").get<std::uint64_t>(),
            .sha256 = item.at("sha256").get<std::string>(),
        });
    }
    manifest.Validate();
    return manifest;
}

void ReleaseManifest::Validate() const
{
    if (schemaVersion != CurrentSchemaVersion)
    {
        throw std::invalid_argument("Unsupported release manifest schema.");
    }
    if (platform != "windows-x86_64")
    {
        throw std::invalid_argument("Release manifest targets an unsupported platform.");
    }
    if (files.empty() || files.size() > 100000)
    {
        throw std::invalid_argument("Release manifest has an invalid file count.");
    }

    std::unordered_set<std::string> paths;
    bool hasClient = false;
    for (const auto& file : files)
    {
        if (!IsSafeRelativePath(file.path))
        {
            throw std::invalid_argument("Release manifest contains an unsafe path.");
        }
        if (!IsSha256(file.sha256))
        {
            throw std::invalid_argument("Release manifest contains an invalid SHA-256.");
        }
        if (!paths.insert(file.path).second)
        {
            throw std::invalid_argument("Release manifest contains a duplicate path.");
        }
        hasClient = hasClient || file.path == "MirajOfIcarusClient.exe";
    }
    if (!hasClient)
    {
        throw std::invalid_argument("Release manifest does not contain the game executable.");
    }
}
}
