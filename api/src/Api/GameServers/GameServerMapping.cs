using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.GameServers;

namespace MirajOfIcarus.Api.GameServers;

internal static class GameServerMapping
{
    public static GameServerResponse ToResponse(this GameServer server) => new(
        server.Id,
        server.Name,
        server.Region,
        server.LoginEndpoint,
        server.Available);
}
