#pragma once
#include <cstdint>
#include <string>
#include <vector>

namespace miraj_of_icarus::launcher
{
struct GameServer { std::string id, name, region, loginEndpoint; bool available = false; };
struct LobbyAdmission { std::uint32_t sessionId = 0; std::string lobbyEndpoint, lobbyTicket; };
struct AccountSession { std::string accessToken, refreshToken; };

class BackendClient
{
public:
    explicit BackendClient(std::string apiEndpoint);
    [[nodiscard]] std::vector<GameServer> GetServers() const;
    [[nodiscard]] AccountSession Login(
        const std::string& userName, const std::string& password) const;
    [[nodiscard]] AccountSession Refresh(const AccountSession& session) const;
    [[nodiscard]] LobbyAdmission EnterGame(
        const AccountSession& session, const GameServer& server) const;
private:
    std::string apiEndpoint_;
};

}
