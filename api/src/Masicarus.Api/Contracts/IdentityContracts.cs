namespace Masicarus.Api.Contracts;

public sealed record RegisterAccountRequest(string UserName, string Password);

public sealed record LoginRequest(string UserName, string Password);

public sealed record AccountResponse(long AccountId, string UserName);

public sealed record LoginResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    string RefreshToken,
    DateTimeOffset RefreshExpiresAt,
    AccountResponse Account);

public sealed record RefreshTokenRequest(string RefreshToken);

public sealed record LogoutRequest(string RefreshToken);

public sealed record AccessSession(long AccountId, string UserName, DateTimeOffset ExpiresAt);

public sealed record RefreshSession(long AccountId, string UserName, DateTimeOffset ExpiresAt);

public sealed record GameServerResponse(
    string Id,
    string Name,
    string Region,
    string LoginEndpoint,
    bool Available);

public sealed record GameTicketRequest(string ServerId);

public sealed record GameTicketResponse(
    string Ticket,
    DateTimeOffset ExpiresAt,
    GameServerResponse Server);
