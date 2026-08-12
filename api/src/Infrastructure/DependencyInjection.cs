using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Application.GameServers;
using MirajOfIcarus.Application.Releases;
using MirajOfIcarus.Infrastructure.Accounts;
using MirajOfIcarus.Infrastructure.Authentication;
using MirajOfIcarus.Infrastructure.Characters;
using MirajOfIcarus.Infrastructure.GameServers;
using MirajOfIcarus.Infrastructure.Health;
using MirajOfIcarus.Infrastructure.Persistence;
using MirajOfIcarus.Infrastructure.Releases;
using MirajOfIcarus.Game.Runtime;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using StackExchange.Redis;

namespace MirajOfIcarus.Infrastructure;

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
