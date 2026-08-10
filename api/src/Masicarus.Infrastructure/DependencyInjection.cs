using Masicarus.Infrastructure.Health;
using Masicarus.Infrastructure.Identity;
using Masicarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace Masicarus.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        IHealthChecksBuilder healthChecks)
    {
        var databaseConnection = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException(
                "ConnectionStrings:Database não foi configurada.");
        var redisConnection = configuration["Cache:ConnectionString"]
            ?? throw new InvalidOperationException(
                "Cache:ConnectionString não foi configurada.");

        services.AddDbContextFactory<PlatformDbContext>(options =>
            options.UseNpgsql(databaseConnection, postgres =>
                postgres.EnableRetryOnFailure(3)));

        services.AddSingleton<IConnectionMultiplexer>(_ =>
        {
            var options = ConfigurationOptions.Parse(redisConnection);
            options.AbortOnConnectFail = false;
            return ConnectionMultiplexer.Connect(options);
        });
        services.AddSingleton<OpaqueTokenStore>();

        healthChecks
            .AddCheck<PostgresHealthCheck>("postgres", tags: ["ready"])
            .AddCheck<RedisHealthCheck>("redis", tags: ["ready"]);

        return services;
    }
}
