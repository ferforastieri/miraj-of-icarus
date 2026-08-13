using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace MirajOfIcarus.Infrastructure.Health;

internal sealed class RedisHealthCheck(
    IConnectionMultiplexer connection) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var latency = await connection.GetDatabase().PingAsync();

            return HealthCheckResult.Healthy(
                $"Redis disponível em {latency.TotalMilliseconds:F0} ms");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy(
                "Falha ao consultar Redis",
                exception);
        }
    }
}
