namespace MirajOfIcarus.Application.Authentication;

public sealed record AccountIdentity(long AccountId, string UserName);

public sealed record AccessSession(long AccountId, string UserName, DateTimeOffset ExpiresAt);

public sealed record RefreshSession(long AccountId, string UserName, DateTimeOffset ExpiresAt);

public sealed record LoginSession(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshExpiresAt,
    AccountIdentity Account);
