using MirajOfIcarus.Application.Security;
using StackExchange.Redis;

namespace MirajOfIcarus.Infrastructure.Security;

public sealed class RedisRateLimitStore(IConnectionMultiplexer redis) : IRateLimitStore
{
    private static readonly LuaScript AcquireScript = LuaScript.Prepare("""
        local count = redis.call('INCR', @key)
        if count == 1 then redis.call('PEXPIRE', @key, @window) end
        local ttl = redis.call('PTTL', @key)
        return { count, ttl }
        """);

    public async ValueTask<RateLimitDecision> AcquireAsync(
        string policy,
        string partition,
        int limit,
        TimeSpan window,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var key = $"miraj-of-icarus:rate:{policy}:{partition}";
        var result = (RedisResult[])(await redis.GetDatabase().ScriptEvaluateAsync(
            AcquireScript,
            new
            {
                key = (RedisKey)key,
                window = (long)Math.Ceiling(window.TotalMilliseconds),
            }))!;
        var count = (long)result[0];
        var milliseconds = Math.Max(1000, (long)result[1]);
        return new RateLimitDecision(
            count <= limit,
            limit,
            Math.Max(0, limit - count),
            TimeSpan.FromMilliseconds(milliseconds));
    }
}
