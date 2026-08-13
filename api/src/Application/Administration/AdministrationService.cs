using System.Text.Json;
using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Application.Common;
using MirajOfIcarus.Application.GameServers;
using MirajOfIcarus.Domain.Accounts;
using MirajOfIcarus.Domain.Administration;

namespace MirajOfIcarus.Application.Administration;

public sealed class AdministrationService(
    IAccountRepository accounts,
    ICharacterRepository characters,
    IAdministrationRepository administration,
    IGameServerCatalog serverCatalog,
    ITokenStore tokens,
    TimeProvider timeProvider)
{
    public async Task<AdministrationOverview> OverviewAsync(CancellationToken cancellationToken = default)
    {
        var servers = serverCatalog.GetAll();
        var overrides = await administration.ListServerOverridesAsync(cancellationToken);
        var available = servers.Count(server => server.Available &&
            (!overrides.TryGetValue(server.Id, out var value) || !value.Maintenance));
        return new AdministrationOverview(
            await accounts.CountAsync(cancellationToken),
            await administration.CountCharactersAsync(cancellationToken),
            available,
            servers.Count);
    }

    public async Task<AccountPage> SearchAccountsAsync(string? query, int page, int pageSize,
        CancellationToken cancellationToken = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        return new AccountPage(
            await accounts.SearchAsync(query, (page - 1) * pageSize, pageSize, cancellationToken),
            await accounts.CountMatchingAsync(query, cancellationToken), page, pageSize);
    }

    public Task<Account?> FindAccountAsync(long id, CancellationToken cancellationToken = default) =>
        accounts.FindByIdAsync(id, cancellationToken);

    public async Task<ApplicationResult<Account>> PromoteAsync(
        string? userName, CancellationToken cancellationToken = default)
    {
        var normalized = userName?.Trim().ToUpperInvariant();
        var account = string.IsNullOrWhiteSpace(normalized)
            ? null
            : await accounts.FindByNormalizedUserNameAsync(normalized, cancellationToken);
        if (account is null)
            return ApplicationResult.Failure<Account>("account_not_found", ApplicationErrorType.NotFound);
        account.PromoteToAdministrator();
        await accounts.SaveAsync(account, cancellationToken);
        await tokens.RevokeAccountAsync(account.Id, cancellationToken);
        await AuditAsync(account.Id, "account.promote-administrator", $"account:{account.Id}",
            new { source = "operator-command" }, cancellationToken);
        return ApplicationResult.Success(account);
    }

    public Task<IReadOnlyList<MirajOfIcarus.Domain.Characters.Character>> ListCharactersAsync(
        long accountId, CancellationToken cancellationToken = default) =>
        characters.ListAsync(accountId, cancellationToken);

    public Task AuditCharacterActionAsync(long administratorId, string action, long accountId,
        Guid characterId, CancellationToken cancellationToken = default) => AuditAsync(
        administratorId, action, $"account:{accountId}/character:{characterId}",
        new { accountId, characterId }, cancellationToken);

    public async Task<ApplicationResult<Account>> SuspendAsync(long administratorId, long accountId,
        string? reason, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(reason) || reason.Trim().Length > 500)
            return ApplicationResult.Failure<Account>("invalid_suspension_reason", ApplicationErrorType.Validation);
        var account = await accounts.FindByIdAsync(accountId, cancellationToken);
        if (account is null) return ApplicationResult.Failure<Account>("account_not_found", ApplicationErrorType.NotFound);
        if (account.Id == administratorId)
            return ApplicationResult.Failure<Account>("cannot_suspend_self", ApplicationErrorType.Conflict);
        account.Suspend(reason, timeProvider.GetUtcNow());
        await accounts.SaveAsync(account, cancellationToken);
        await tokens.RevokeAccountAsync(account.Id, cancellationToken);
        await AuditAsync(administratorId, "account.suspend", $"account:{account.Id}",
            new { reason = reason.Trim() }, cancellationToken);
        return ApplicationResult.Success(account);
    }

    public async Task<ApplicationResult<Account>> RestoreAsync(long administratorId, long accountId,
        CancellationToken cancellationToken = default)
    {
        var account = await accounts.FindByIdAsync(accountId, cancellationToken);
        if (account is null) return ApplicationResult.Failure<Account>("account_not_found", ApplicationErrorType.NotFound);
        account.Restore();
        await accounts.SaveAsync(account, cancellationToken);
        await AuditAsync(administratorId, "account.restore", $"account:{account.Id}", new { }, cancellationToken);
        return ApplicationResult.Success(account);
    }

    public async Task<ApplicationResult<GameServerOverride>> SetMaintenanceAsync(long administratorId,
        string serverId, bool maintenance, string? message, CancellationToken cancellationToken = default)
    {
        if (!serverCatalog.GetAll().Any(server => server.Id == serverId))
            return ApplicationResult.Failure<GameServerOverride>("server_not_found", ApplicationErrorType.NotFound);
        if (message?.Length > 240)
            return ApplicationResult.Failure<GameServerOverride>("invalid_maintenance_message", ApplicationErrorType.Validation);
        var now = timeProvider.GetUtcNow();
        var value = await administration.FindServerOverrideAsync(serverId, cancellationToken)
            ?? new GameServerOverride(serverId, maintenance, message, now, administratorId);
        value.Set(maintenance, message, now, administratorId);
        await administration.SaveServerOverrideAsync(value, cancellationToken);
        await AuditAsync(administratorId, "server.maintenance", $"server:{serverId}",
            new { maintenance, message }, cancellationToken);
        return ApplicationResult.Success(value);
    }

    public Task<IReadOnlyList<AdministrationAudit>> ListAuditAsync(int take,
        CancellationToken cancellationToken = default) =>
        administration.ListAuditAsync(Math.Clamp(take, 1, 200), cancellationToken);

    private Task AuditAsync(long administratorId, string action, string target, object details,
        CancellationToken cancellationToken) => administration.AddAuditAsync(
            new AdministrationAudit(administratorId, action, target,
                JsonSerializer.Serialize(details), timeProvider.GetUtcNow()), cancellationToken);
}
