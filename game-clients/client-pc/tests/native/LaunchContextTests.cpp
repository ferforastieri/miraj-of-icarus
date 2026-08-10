#include "masicarus/client/LaunchContext.h"
#include "masicarus/client/ReleaseManifest.h"

#include <cstdlib>
#include <exception>
#include <iostream>
#include <stdexcept>
#include <string>

namespace
{
void Require(bool condition, const std::string& message)
{
    if (!condition)
    {
        throw std::runtime_error(message);
    }
}

template<typename Action>
void RequireInvalid(Action action, const std::string& message)
{
    bool rejected = false;
    try
    {
        action();
    }
    catch (const std::invalid_argument&)
    {
        rejected = true;
    }
    Require(rejected, message);
}
}

int main()
{
    try
    {
        const masicarus::client::LaunchContext source{
            .schemaVersion = 1,
            .sessionId = 42,
            .lobbyEndpoint = "https://lobby.example.invalid",
            .lobbyTicket = std::string(48, 'a'),
            .locale = "pt-BR",
        };
        const auto restored = masicarus::client::LaunchContext::Deserialize(source.Serialize());
        Require(restored.sessionId == source.sessionId, "session id did not round-trip");
        Require(restored.lobbyEndpoint == source.lobbyEndpoint, "endpoint did not round-trip");
        Require(restored.lobbyTicket == source.lobbyTicket, "ticket did not round-trip");
        Require(restored.locale == source.locale, "locale did not round-trip");

        auto invalid = source;
        invalid.lobbyEndpoint = "file:///preserved/client";
        RequireInvalid([&invalid] { invalid.Validate(); }, "non-HTTP endpoint was accepted");

        const auto hash = std::string(64, 'a');
        const auto manifest = masicarus::client::ReleaseManifest::Deserialize(
            R"({"schemaVersion":1,"platform":"windows-x86_64","files":[)" +
            std::string(R"({"path":"MasicarusClient.exe","size":10,"sha256":")") + hash +
            R"("}]})");
        Require(manifest.files.size() == 1, "release files did not deserialize");

        const auto unsafePayload =
            R"({"schemaVersion":1,"platform":"windows-x86_64","files":[)" +
            std::string(R"({"path":"../MasicarusClient.exe","size":10,"sha256":")") + hash +
            R"("}]})";
        RequireInvalid([&unsafePayload]
        {
            static_cast<void>(masicarus::client::ReleaseManifest::Deserialize(unsafePayload));
        }, "unsafe release path was accepted");

        const auto duplicatePayload =
            R"({"schemaVersion":1,"platform":"windows-x86_64","files":[)" +
            std::string(R"({"path":"MasicarusClient.exe","size":10,"sha256":")") + hash +
            R"("},{"path":"MasicarusClient.exe","size":10,"sha256":")" + hash + R"("}]})";
        RequireInvalid([&duplicatePayload]
        {
            static_cast<void>(masicarus::client::ReleaseManifest::Deserialize(duplicatePayload));
        }, "duplicate release path was accepted");
    }
    catch (const std::exception& exception)
    {
        std::cerr << exception.what() << '\n';
        return EXIT_FAILURE;
    }

    return EXIT_SUCCESS;
}
