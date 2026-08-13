using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Application.Common;
using MirajOfIcarus.Game.Contracts;
using MirajOfIcarus.Application.Administration;

namespace MirajOfIcarus.Application.GameServers;

public sealed class GameServerService(
    IGameServerCatalog catalog,
    IAdministrationRepository administration,
    ITokenStore tokens,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan GameTicketLifetime = TimeSpan.FromSeconds(60);

    public async Task<IReadOnlyList<GameServer>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var overrides = await administration.ListServerOverridesAsync(cancellationToken);
        return catalog.GetAll().Select(server =>
        {
            if (!overrides.TryGetValue(server.Id, out var value) || !value.Maintenance) return server;
            return server with { Available = false, MaintenanceMessage = value.Message };
        }).ToArray();
    }

    public async Task<ApplicationResult<GameTicket>> IssueTicketAsync(
        AccountIdentity account,
        string serverId,
        CancellationToken cancellationToken = default)
    {
        var server = (await GetAllAsync(cancellationToken)).SingleOrDefault(value => value.Id == serverId);
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
