using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace MirajOfIcarus.Infrastructure.Health;

internal sealed class PostgresHealthCheck(
    IDbContextFactory<PlatformDbContext> contextFactory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await using var database = await contextFactory.CreateDbContextAsync(
                cancellationToken);

            return await database.Database.CanConnectAsync(cancellationToken)
                ? HealthCheckResult.Healthy("PostgreSQL disponível")
                : HealthCheckResult.Unhealthy("PostgreSQL indisponível");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "Falha ao consultar PostgreSQL",
                exception);
        }
    }
}
