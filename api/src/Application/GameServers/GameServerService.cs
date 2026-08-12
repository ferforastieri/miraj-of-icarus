using Masicarus.Application.Authentication;
using Masicarus.Application.Common;
using Masicarus.Game.Contracts;

namespace Masicarus.Application.GameServers;

public sealed class GameServerService(
    IGameServerCatalog catalog,
    ITokenStore tokens,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan GameTicketLifetime = TimeSpan.FromSeconds(60);

    public IReadOnlyList<GameServer> GetAll() => catalog.GetAll();

    public async Task<ApplicationResult<GameTicket>> IssueTicketAsync(
        AccountIdentity account,
        string serverId,
        CancellationToken cancellationToken = default)
    {
        var server = catalog.GetAll().SingleOrDefault(value => value.Id == serverId);
        if (server is null || !server.Available)
        {
            return ApplicationResult.Failure<GameTicket>(
                "server_unavailable", ApplicationErrorType.NotFound);
        }

        var expiresAt = timeProvider.GetUtcNow().Add(GameTicketLifetime);
        var ticket = await tokens.IssueAsync(
            "login",
            new LoginTicket(account.AccountId, account.UserName, server.Id, expiresAt),
            GameTicketLifetime,
            cancellationToken);
        return ApplicationResult.Success(
            new GameTicket(ticket, expiresAt, server));
    }
}
