#include "BackendClient.h"
#include "masicarus/client/windows/WinHttpClient.h"
#include <nlohmann/json.hpp>

#include <stdexcept>
#include <string_view>

namespace masicarus::launcher
{
namespace
{
using masicarus::client::windows::JoinEndpoint;
using masicarus::client::windows::RequestJson;

template <typename Operation>
auto RunStage(std::string_view stage, Operation&& operation)
{
    try
    {
        return operation();
    }
    catch (const std::exception& exception)
    {
        throw std::runtime_error(std::string(stage) + " failed: " + exception.what());
    }
}
}

BackendClient::BackendClient(std::string endpoint) : apiEndpoint_(std::move(endpoint)) {}

std::vector<GameServer> BackendClient::GetServers() const
{
    std::vector<GameServer> result;
    for (const auto& item : nlohmann::json::parse(
             RequestJson("GET", JoinEndpoint(apiEndpoint_, "/v1/game-servers"))))
        result.push_back({item.at("id"), item.at("name"), item.at("region"), item.at("loginEndpoint"), item.at("available")});
    return result;
}

LobbyAdmission BackendClient::Authenticate(const std::string& user, const std::string& password, const GameServer& server) const
{
    const auto login = RunStage("Account authentication", [&] {
        return nlohmann::json::parse(RequestJson("POST", JoinEndpoint(apiEndpoint_, "/v1/auth/login"),
            nlohmann::json{{"userName", user}, {"password", password}}.dump()));
    });
    const auto accessToken = login.at("accessToken").get<std::string>();
    const auto game = RunStage("Game ticket", [&] {
        return nlohmann::json::parse(RequestJson("POST", JoinEndpoint(apiEndpoint_, "/v1/game-tickets"),
            nlohmann::json{{"serverId", server.id}}.dump(), accessToken));
    });
    const auto admission = RunStage("Login admission", [&] {
        return nlohmann::json::parse(RequestJson("POST", JoinEndpoint(server.loginEndpoint, "/v1/sessions"),
            nlohmann::json{{"ticket", game.at("ticket")}}.dump()));
    });
    return {admission.at("sessionId"), admission.at("lobbyEndpoint"), admission.at("lobbyTicket")};
}
}
