namespace MirajOfIcarus.Application.GameServers;

public sealed record GameServer(
    string Id,
    string Name,
    string Region,
    string LoginEndpoint,
    bool Available);

public sealed record GameTicket(
    string Ticket,
    DateTimeOffset ExpiresAt,
    GameServer Server);

public interface IGameServerCatalog
{
    IReadOnlyList<GameServer> GetAll();
}
