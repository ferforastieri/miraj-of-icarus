#pragma once

#include <cstdint>
#include <string>
#include <vector>

namespace masicarus::client
{
struct ReleaseFile
{
    std::string path;
    std::uint64_t size = 0;
    std::string sha256;
};

struct ReleaseManifest
{
    static constexpr int CurrentSchemaVersion = 1;

    int schemaVersion = CurrentSchemaVersion;
    std::string platform;
    std::vector<ReleaseFile> files;

    [[nodiscard]] static ReleaseManifest Deserialize(const std::string& payload);
    void Validate() const;
};
}
