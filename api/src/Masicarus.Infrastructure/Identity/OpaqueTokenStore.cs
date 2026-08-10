using System.Security.Cryptography;
using System.Text.Json;
using StackExchange.Redis;

namespace Masicarus.Infrastructure.Identity;

public sealed class OpaqueTokenStore(IConnectionMultiplexer redis)
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);

    public async ValueTask<string> IssueAsync<T>(
        string purpose,
        T payload,
        TimeSpan lifetime,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(purpose);
        cancellationToken.ThrowIfCancellationRequested();

        var token = ToBase64Url(RandomNumberGenerator.GetBytes(32));
        var key = BuildKey(purpose, token);
        var stored = await redis.GetDatabase().StringSetAsync(
            key,
            JsonSerializer.Serialize(payload, SerializerOptions),
            lifetime,
            when: When.NotExists);
        if (!stored)
        {
            throw new InvalidOperationException("Could not reserve a unique opaque token.");
        }

        return token;
    }

    public async ValueTask<T?> ReadAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var value = await redis.GetDatabase().StringGetAsync(BuildKey(purpose, token));
        return value.IsNullOrEmpty
            ? default
            : JsonSerializer.Deserialize<T>((string)value!, SerializerOptions);
    }

    private static string BuildKey(string purpose, string token)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(token);
        var digest = SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(token));
        return $"masicarus:token:{purpose}:{Convert.ToHexStringLower(digest)}";
    }

    private static string ToBase64Url(byte[] value) => Convert
        .ToBase64String(value)
        .TrimEnd('=')
        .Replace('+', '-')
        .Replace('/', '_');
}
