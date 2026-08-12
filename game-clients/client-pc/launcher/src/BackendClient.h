#pragma once
#include <cstdint>
#include <string>
#include <vector>

namespace miraj_of_icarus::launcher
{
struct GameServer { std::string id, name, region, loginEndpoint; bool available = false; };
struct LobbyAdmission { std::uint32_t sessionId = 0; std::string lobbyEndpoint, lobbyTicket; };

class BackendClient
{
public:
    explicit BackendClient(std::string apiEndpoint);
    [[nodiscard]] std::vector<GameServer> GetServers() const;
    [[nodiscard]] LobbyAdmission Authenticate(
        const std::string& userName, const std::string& password, const GameServer& server) const;
private:
    std::string apiEndpoint_;
};

}
