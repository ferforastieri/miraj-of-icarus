using System.Net;
using Masicarus.Domain.Platform;
using Masicarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace Masicarus.Api.Tests;

[Trait("Category", "Infrastructure")]
public sealed class InfrastructureReadinessTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task ReadyEndpointReturnsSuccess()
    {
        using var client = factory.CreateClient();
        using var response = await client.GetAsync("/health/ready");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task PostgreSqlAndRedisSupportReadWriteOperations()
    {
        await using var scope = factory.Services.CreateAsyncScope();
        var contextFactory = scope.ServiceProvider
            .GetRequiredService<IDbContextFactory<PlatformDbContext>>();
        var redis = scope.ServiceProvider
            .GetRequiredService<IConnectionMultiplexer>()
            .GetDatabase();
        var suffix = Guid.NewGuid().ToString("N");
        var databaseKey = $"integration-test:{suffix}";
        var redisKey = (RedisKey)$"masicarus:integration-test:{suffix}";

        await using var database = await contextFactory.CreateDbContextAsync();

        try
        {
            database.PlatformMetadata.Add(new(
                databaseKey,
                "verified",
                DateTimeOffset.UtcNow));
            await database.SaveChangesAsync();

            var stored = await database.PlatformMetadata
                .AsNoTracking()
                .SingleAsync(entry => entry.Key == databaseKey);
            Assert.Equal("verified", stored.Value);

            Assert.True(await redis.StringSetAsync(
                redisKey,
                "verified",
                TimeSpan.FromMinutes(1)));
            Assert.Equal("verified", (string?)await redis.StringGetAsync(redisKey));
        }
        finally
        {
            await database.PlatformMetadata
                .Where(entry => entry.Key == databaseKey)
                .ExecuteDeleteAsync();
            await redis.KeyDeleteAsync(redisKey);
        }
    }
}
