using Masicarus.Application.Authentication;
using Masicarus.Game.Runtime;

namespace Masicarus.Infrastructure.Authentication;

public sealed class GameTokenStoreAdapter(OpaqueTokenStore tokens) : ITokenStore
{
    public ValueTask<string> IssueAsync<T>(
        string purpose,
        T payload,
        TimeSpan lifetime,
        CancellationToken cancellationToken = default) =>
        tokens.IssueAsync(purpose, payload, lifetime, cancellationToken);

    public ValueTask<T?> ReadAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default) =>
        tokens.ReadAsync<T>(purpose, token, cancellationToken);

    public ValueTask<T?> ConsumeAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default) =>
        tokens.ConsumeAsync<T>(purpose, token, cancellationToken);

    public ValueTask RevokeAsync(
        string purpose,
        string token,
        CancellationToken cancellationToken = default) =>
        tokens.RevokeAsync(purpose, token, cancellationToken);
}
