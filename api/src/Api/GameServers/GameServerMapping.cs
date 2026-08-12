using Masicarus.Api.Contracts;
using Masicarus.Application.GameServers;

namespace Masicarus.Api.GameServers;

internal static class GameServerMapping
{
    public static GameServerResponse ToResponse(this GameServer server) => new(
        server.Id,
        server.Name,
        server.Region,
        server.LoginEndpoint,
        server.Available);
}
