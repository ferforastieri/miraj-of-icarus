namespace MirajOfIcarus.Application.Security;

public sealed record RateLimitDecision(
    bool Allowed,
    int Limit,
    long Remaining,
    TimeSpan RetryAfter);

public interface IRateLimitStore
{
    ValueTask<RateLimitDecision> AcquireAsync(
        string policy,
        string partition,
        int limit,
        TimeSpan window,
        CancellationToken cancellationToken = default);
}
