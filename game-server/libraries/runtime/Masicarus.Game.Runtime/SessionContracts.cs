namespace Masicarus.Game.Runtime;

public sealed record LobbyTicket(
    long AccountId,
    string UserName,
    uint SessionId,
    DateTimeOffset ExpiresAt);

public sealed record LobbySession(
    long AccountId,
    string UserName,
    uint SessionId,
    DateTimeOffset ExpiresAt);
