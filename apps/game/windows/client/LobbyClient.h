#pragma once

#include <string>
#include <vector>

namespace miraj_of_icarus::game
{
struct Character
{
    std::string id;
    std::string name;
    std::string archetype;
    std::string gender;
    std::string customization;
    int level = 1;
};

struct LobbyState
{
    std::string sessionToken;
    std::vector<Character> characters;
};

class LobbyClient
{
public:
    explicit LobbyClient(std::string endpoint);
    [[nodiscard]] LobbyState Enter(const std::string& oneTimeTicket) const;
    [[nodiscard]] std::vector<Character> ListCharacters(const std::string& sessionToken) const;

private:
    std::string endpoint_;
};
}
