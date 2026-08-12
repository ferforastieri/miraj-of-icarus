using Masicarus.Application.Accounts;
using Masicarus.Application.Authentication;
using Masicarus.Application.Characters;
using Masicarus.Application.GameServers;
using Masicarus.Application.Releases;
using Masicarus.Infrastructure.Accounts;
using Masicarus.Infrastructure.Authentication;
using Masicarus.Infrastructure.Characters;
using Masicarus.Infrastructure.GameServers;
using Masicarus.Infrastructure.Health;
using Masicarus.Infrastructure.Persistence;
using Masicarus.Infrastructure.Releases;
using Masicarus.Game.Runtime;
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
        services.AddSingleton<ITokenStore, GameTokenStoreAdapter>();
        services.AddScoped<IAccountRepository, AccountRepository>();
        services.AddScoped<ICharacterRepository, CharacterRepository>();
        services.AddSingleton<IGameServerCatalog, ConfiguredGameServerCatalog>();
        services.AddSingleton<IClientReleaseProvider, R2ClientReleaseProvider>();

        healthChecks
            .AddCheck<PostgresHealthCheck>("postgres", tags: ["ready"])
            .AddCheck<RedisHealthCheck>("redis", tags: ["ready"]);

        return services;
    }
}
