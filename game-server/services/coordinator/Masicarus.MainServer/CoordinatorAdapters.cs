using System.Security.Cryptography;
using System.Text.Json;
using Masicarus.Game.Contracts;
using Masicarus.MainServer.Coordinator;
using StackExchange.Redis;

namespace Masicarus.MainServer;

public sealed class RedisPlayerSessionRepository(IConnectionMultiplexer redis)
    : IPlayerSessionRepository
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private const string RemoveScript =
        "local value = redis.call('GET', KEYS[1]); " +
        "if not value then return 0; end; " +
        "local session = cjson.decode(value); " +
        "if session.sessionId ~= tonumber(ARGV[1]) then return 0; end; " +
        "redis.call('DEL', KEYS[1]); return 1;";
    private static readonly TimeSpan SessionLifetime = TimeSpan.FromMinutes(30);

    public async ValueTask<PlayerSession?> FindByUserIdAsync(
        uint userId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var value = await redis.GetDatabase().StringGetAsync(BuildKey(userId));
        return Deserialize(value);
    }

    public async ValueTask<PlayerSession?> TryRegisterAsync(
        PlayerSession candidate,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var database = redis.GetDatabase();
        var key = BuildKey(candidate.UserId);
        var stored = await database.StringSetAsync(
            key,
            JsonSerializer.Serialize(candidate, SerializerOptions),
            SessionLifetime,
            when: When.NotExists);
        return stored ? null : Deserialize(await database.StringGetAsync(key));
    }

    public async ValueTask<bool> TryRemoveAsync(
        uint userId,
        uint sessionId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var result = await redis.GetDatabase().ScriptEvaluateAsync(
            RemoveScript,
            [(RedisKey)BuildKey(userId)],
            [(RedisValue)(long)sessionId]);
        return (long)result == 1;
    }

    private static string BuildKey(uint userId) => $"masicarus:main:session:{userId}";

    private static PlayerSession? Deserialize(RedisValue value) => value.IsNullOrEmpty
        ? null
        : JsonSerializer.Deserialize<PlayerSession>((string)value!, SerializerOptions);
}

public sealed class LobbyWorldDirectory(IConfiguration configuration) : IWorldDirectory
{
    public ValueTask<WorldDestination?> FindAsync(
        uint worldId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        if (worldId != 1)
        {
            return ValueTask.FromResult<WorldDestination?>(null);
        }

        var endpoint = configuration["Lobby:Endpoint"]
            ?? throw new InvalidOperationException("Lobby:Endpoint is required.");
        var uri = new Uri(endpoint, UriKind.Absolute);
        var destination = new WorldDestination(
            worldId,
            "Lobby",
            uri.Host,
            checked((ushort)uri.Port),
            true);
        return ValueTask.FromResult<WorldDestination?>(destination);
    }
}

public sealed class SecureTransitionValueIssuer : ITransitionValueIssuer
{
    public ValueTask<uint> IssueAsync(
        PlayerSession session,
        WorldDestination destination,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        return ValueTask.FromResult(RandomNonZeroUInt32());
    }

    public static uint RandomNonZeroUInt32()
    {
        uint value;
        do
        {
            value = BitConverter.ToUInt32(RandomNumberGenerator.GetBytes(sizeof(uint)));
        }
        while (value == 0);

        return value;
    }
}

public sealed class SystemCoordinatorClock(TimeProvider timeProvider) : ICoordinatorClock
{
    public DateTimeOffset UtcNow => timeProvider.GetUtcNow();
}
