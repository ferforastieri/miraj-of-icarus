using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Game.Runtime;
using StackExchange.Redis;

namespace MirajOfIcarus.Infrastructure.Authentication;

public sealed class GameTokenStoreAdapter(
    OpaqueTokenStore tokens,
    IConnectionMultiplexer redis) : ITokenStore
{
    private static string AccountKey(long accountId) =>
        $"miraj-of-icarus:account:{accountId}:tokens";

    public async ValueTask<string> IssueAsync<T>(
        string purpose,
        T payload,
        TimeSpan lifetime,
        CancellationToken cancellationToken = default)
    {
        var token = await tokens.IssueAsync(purpose, payload, lifetime, cancellationToken);
        var accountId = payload switch
        {
            AccessSession access => access.AccountId,
            RefreshSession refresh => refresh.AccountId,
            _ => (long?)null,
        };
        if (accountId is not null)
        {
            var database = redis.GetDatabase();
            var accountKey = AccountKey(accountId.Value);
            await database.SetAddAsync(accountKey, OpaqueTokenStore.BuildKey(purpose, token));
            await database.KeyExpireAsync(accountKey, TimeSpan.FromDays(31));
        }
        return token;
    }

    public ValueTask<T?> ReadAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default) =>
        tokens.ReadAsync<T>(purpose, token, cancellationToken);

    public async ValueTask<T?> ConsumeAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default)
    {
        var value = await tokens.ConsumeAsync<T>(purpose, token, cancellationToken);
        await RemoveIndexAsync(purpose, token, value);
        return value;
    }

    public async ValueTask RevokeAsync(
        string purpose,
        string token,
        CancellationToken cancellationToken = default)
    {
        object? payload = purpose switch
        {
            "access" => await tokens.ReadAsync<AccessSession>(purpose, token, cancellationToken),
            "refresh" => await tokens.ReadAsync<RefreshSession>(purpose, token, cancellationToken),
            _ => null,
        };
        await tokens.RevokeAsync(purpose, token, cancellationToken);
        await RemoveIndexAsync(purpose, token, payload);
    }

    public async ValueTask RevokeAccountAsync(
        long accountId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var database = redis.GetDatabase();
        var index = AccountKey(accountId);
        var keys = await database.SetMembersAsync(index);
        if (keys.Length > 0)
        {
            await database.KeyDeleteAsync(keys.Select(value => (RedisKey)(string)value!).ToArray());
        }
        await database.KeyDeleteAsync(index);
    }

    private async ValueTask RemoveIndexAsync<T>(string purpose, string token, T? payload)
    {
        var accountId = payload switch
        {
            AccessSession access => access.AccountId,
            RefreshSession refresh => refresh.AccountId,
            _ => (long?)null,
        };
        if (accountId is not null)
        {
            await redis.GetDatabase().SetRemoveAsync(
                AccountKey(accountId.Value), OpaqueTokenStore.BuildKey(purpose, token));
        }
    }
}
