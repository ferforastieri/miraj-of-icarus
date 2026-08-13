using MirajOfIcarus.Domain.Administration;

namespace MirajOfIcarus.Application.Administration;

public sealed record AdministrationOverview(
    long Accounts,
    long Characters,
    int AvailableServers,
    int TotalServers);

public sealed record AccountPage(
    IReadOnlyList<MirajOfIcarus.Domain.Accounts.Account> Items,
    long Total,
    int Page,
    int PageSize);

public interface IAdministrationRepository
{
    Task<long> CountCharactersAsync(CancellationToken cancellationToken = default);
    Task<GameServerOverride?> FindServerOverrideAsync(string serverId, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, GameServerOverride>> ListServerOverridesAsync(CancellationToken cancellationToken = default);
    Task SaveServerOverrideAsync(GameServerOverride value, CancellationToken cancellationToken = default);
    Task AddAuditAsync(AdministrationAudit audit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<AdministrationAudit>> ListAuditAsync(int take, CancellationToken cancellationToken = default);
}
