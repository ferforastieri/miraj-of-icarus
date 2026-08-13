#pragma once

#include <cstdint>
#include <string>

namespace miraj_of_icarus::client
{
struct LaunchContext
{
    static constexpr int CurrentSchemaVersion = 1;

    int schemaVersion = CurrentSchemaVersion;
    std::uint32_t sessionId = 0;
    std::string lobbyEndpoint;
    std::string lobbyTicket;
    std::string locale = "pt-BR";

    [[nodiscard]] std::string Serialize() const;
    [[nodiscard]] static LaunchContext Deserialize(const std::string& payload);
    void Validate() const;
};
}
