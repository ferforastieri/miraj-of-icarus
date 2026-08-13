using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Domain.Accounts;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MirajOfIcarus.Infrastructure.Accounts;

public sealed class AccountRepository(
    IDbContextFactory<PlatformDbContext> databaseFactory) : IAccountRepository
{
    public async Task<Account?> FindByNormalizedUserNameAsync(
        string normalizedUserName,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Accounts
            .AsNoTracking()
            .SingleOrDefaultAsync(
                account => account.NormalizedUserName == normalizedUserName,
                cancellationToken);
    }

    public async Task<Account?> FindByIdAsync(
        long accountId,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Accounts.AsNoTracking().SingleOrDefaultAsync(
            account => account.Id == accountId, cancellationToken);
    }

    public async Task<long> CountAsync(CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Accounts.LongCountAsync(cancellationToken);
    }

    public async Task<long> CountMatchingAsync(
        string? query,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var accounts = database.Accounts.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = query.Trim().ToUpperInvariant();
            accounts = accounts.Where(account => account.NormalizedUserName.Contains(normalized));
        }
        return await accounts.LongCountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Account>> SearchAsync(
        string? query,
        int skip,
        int take,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var accounts = database.Accounts.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(query))
        {
            var normalized = query.Trim().ToUpperInvariant();
            accounts = accounts.Where(account => account.NormalizedUserName.Contains(normalized));
        }
        return await accounts.OrderByDescending(account => account.CreatedAt)
            .Skip(skip).Take(take).ToArrayAsync(cancellationToken);
    }

    public async Task<bool> CreateAsync(
        Account account,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        database.Accounts.Add(account);
        try
        {
            await database.SaveChangesAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation
            })
        {
            return false;
        }
    }

    public async Task SaveAsync(Account account, CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        database.Accounts.Update(account);
        await database.SaveChangesAsync(cancellationToken);
    }
}
