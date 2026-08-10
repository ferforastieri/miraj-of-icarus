using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Masicarus.Infrastructure.Persistence;

public static class DatabaseMigrationExtensions
{
    private const long MigrationLockId = 4_281_223_946_771_001;

    public static async Task ApplyDatabaseMigrationsAsync(
        this IServiceProvider services,
        CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var factory = scope.ServiceProvider
            .GetRequiredService<IDbContextFactory<PlatformDbContext>>();
        await using var database = await factory.CreateDbContextAsync(
            cancellationToken);

        await database.Database.OpenConnectionAsync(cancellationToken);
        try
        {
            await database.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_lock({MigrationLockId})",
                cancellationToken);
            await database.Database.MigrateAsync(cancellationToken);
        }
        finally
        {
            await database.Database.ExecuteSqlInterpolatedAsync(
                $"SELECT pg_advisory_unlock({MigrationLockId})",
                cancellationToken);
            await database.Database.CloseConnectionAsync();
        }
    }
}
