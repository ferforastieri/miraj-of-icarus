#include "masicarus/client/LaunchContext.h"

#include <nlohmann/json.hpp>

#include <stdexcept>
#include <string_view>

namespace masicarus::client
{
namespace
{
bool IsHttpEndpoint(const std::string& value)
{
    return value.starts_with("http://") || value.starts_with("https://");
}
}

std::string LaunchContext::Serialize() const
{
    Validate();
    return nlohmann::json{
        {"schemaVersion", schemaVersion},
        {"sessionId", sessionId},
        {"lobbyEndpoint", lobbyEndpoint},
        {"lobbyTicket", lobbyTicket},
        {"locale", locale},
    }.dump();
}

LaunchContext LaunchContext::Deserialize(const std::string& payload)
{
    const auto document = nlohmann::json::parse(payload);
    LaunchContext context{
        .schemaVersion = document.at("schemaVersion").get<int>(),
        .sessionId = document.at("sessionId").get<std::uint32_t>(),
        .lobbyEndpoint = document.at("lobbyEndpoint").get<std::string>(),
        .lobbyTicket = document.at("lobbyTicket").get<std::string>(),
        .locale = document.value("locale", "pt-BR"),
    };
    context.Validate();
    return context;
}

void LaunchContext::Validate() const
{
    if (schemaVersion != CurrentSchemaVersion)
    {
        throw std::invalid_argument("Unsupported launcher context schema.");
    }
    if (sessionId == 0)
    {
        throw std::invalid_argument("Session id is required.");
    }
    if (!IsHttpEndpoint(lobbyEndpoint))
    {
        throw std::invalid_argument("Lobby endpoint must use HTTP or HTTPS.");
    }
    if (lobbyTicket.size() < 32 || lobbyTicket.size() > 512)
    {
        throw std::invalid_argument("Game ticket has an invalid length.");
    }
    if (locale.empty() || locale.size() > 16)
    {
        throw std::invalid_argument("Locale has an invalid length.");
    }
}
}
