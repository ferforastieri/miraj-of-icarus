#include "LobbyClient.h"
#include "miraj_of_icarus/client/windows/WinHttpClient.h"

#include <nlohmann/json.hpp>

#include <utility>

namespace miraj_of_icarus::game
{
namespace
{
Character ReadCharacter(const nlohmann::json& document)
{
    return {
        .id = document.at("id"),
        .name = document.at("name"),
        .archetype = document.at("archetype"),
        .gender = document.at("gender"),
        .customization = document.at("customization"),
        .level = document.at("level"),
    };
}
}

LobbyClient::LobbyClient(std::string endpoint) : endpoint_(std::move(endpoint)) {}

LobbyState LobbyClient::Enter(const std::string& oneTimeTicket) const
{
    const auto session = nlohmann::json::parse(miraj_of_icarus::client::windows::RequestJson(
        "POST",
        miraj_of_icarus::client::windows::JoinEndpoint(endpoint_, "/v1/sessions"),
        nlohmann::json{{"ticket", oneTimeTicket}}.dump()));
    LobbyState state{
        .sessionToken = session.at("sessionToken"),
        .characters = {},
    };
    state.characters = ListCharacters(state.sessionToken);
    return state;
}

Character LobbyClient::CreateCharacter(
    const std::string& sessionToken,
    const std::string& name,
    const std::string& archetype,
    const std::string& gender,
    const std::string& customization) const
{
    const auto response = miraj_of_icarus::client::windows::RequestJson(
        "POST",
        miraj_of_icarus::client::windows::JoinEndpoint(endpoint_, "/v1/characters"),
        nlohmann::json{
            {"name", name},
            {"archetype", archetype},
            {"gender", gender},
            {"customization", customization},
        }.dump(),
        sessionToken);
    return ReadCharacter(nlohmann::json::parse(response));
}

std::vector<Character> LobbyClient::ListCharacters(const std::string& sessionToken) const
{
    const auto response = nlohmann::json::parse(miraj_of_icarus::client::windows::RequestJson(
        "GET",
        miraj_of_icarus::client::windows::JoinEndpoint(endpoint_, "/v1/characters"),
        {},
        sessionToken));
    std::vector<Character> characters;
    characters.reserve(response.size());
    for (const auto& document : response) characters.push_back(ReadCharacter(document));
    return characters;
}
}
