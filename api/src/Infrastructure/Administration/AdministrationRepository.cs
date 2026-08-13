using MirajOfIcarus.Application.Administration;
using MirajOfIcarus.Domain.Administration;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MirajOfIcarus.Infrastructure.Administration;

public sealed class AdministrationRepository(
    IDbContextFactory<PlatformDbContext> databaseFactory) : IAdministrationRepository
{
    public async Task<long> CountCharactersAsync(CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Characters.LongCountAsync(cancellationToken);
    }

    public async Task<GameServerOverride?> FindServerOverrideAsync(string serverId,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.GameServerOverrides.SingleOrDefaultAsync(
            value => value.ServerId == serverId, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<string, GameServerOverride>> ListServerOverridesAsync(
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.GameServerOverrides.AsNoTracking()
            .ToDictionaryAsync(value => value.ServerId, cancellationToken);
    }

    public async Task SaveServerOverrideAsync(GameServerOverride value,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        database.GameServerOverrides.Update(value);
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task AddAuditAsync(AdministrationAudit audit,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        database.AdministrationAudits.Add(audit);
        await database.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<AdministrationAudit>> ListAuditAsync(int take,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.AdministrationAudits.AsNoTracking()
            .OrderByDescending(value => value.CreatedAt).Take(take).ToArrayAsync(cancellationToken);
    }
}
