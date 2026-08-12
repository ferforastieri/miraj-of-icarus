namespace MirajOfIcarus.Application.Authentication;

public interface ITokenStore
{
    ValueTask<string> IssueAsync<T>(
        string purpose,
        T payload,
        TimeSpan lifetime,
        CancellationToken cancellationToken = default);

    ValueTask<T?> ReadAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default);

    ValueTask<T?> ConsumeAsync<T>(
        string purpose,
        string token,
        CancellationToken cancellationToken = default);

    ValueTask RevokeAsync(
        string purpose,
        string token,
        CancellationToken cancellationToken = default);
}
