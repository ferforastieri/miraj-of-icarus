using Masicarus.Application.Accounts;
using Masicarus.Domain.Accounts;
using Masicarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace Masicarus.Infrastructure.Accounts;

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
}
