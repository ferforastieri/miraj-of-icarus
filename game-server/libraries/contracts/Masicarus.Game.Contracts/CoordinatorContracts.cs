namespace Masicarus.Game.Contracts;

public readonly record struct ConnectionCorrelation(uint Id, uint Generation);

public sealed record PlayerSession(
    string AccountName,
    uint UserId,
    uint SessionId,
    ConnectionCorrelation LoginConnection,
    DateTimeOffset RegisteredAt);

public sealed record RegisterSessionCommand(
    string AccountName,
    uint UserId,
    uint SessionId,
    ConnectionCorrelation LoginConnection);

public enum RegisterSessionStatus
{
    Registered,
    DuplicateSession,
}

public sealed record RegisterSessionResult(
    RegisterSessionStatus Status,
    PlayerSession Session,
    PlayerSession? ExistingSession);

public sealed record KickSessionCommand(uint UserId, uint SessionId);

public enum KickSessionStatus
{
    Removed,
    SessionNotFound,
    SessionMismatch,
}

public sealed record KickSessionResult(KickSessionStatus Status, PlayerSession? Session);

public sealed record WorldDestination(
    uint WorldId,
    string Name,
    string Host,
    ushort Port,
    bool IsAvailable);

public sealed record SelectWorldCommand(uint UserId, uint SessionId, uint WorldId);

public enum SelectWorldStatus
{
    Selected,
    SessionNotFound,
    SessionMismatch,
    WorldNotFound,
    WorldUnavailable,
}

public sealed record SelectWorldResult(
    SelectWorldStatus Status,
    PlayerSession? Session,
    WorldDestination? Destination,
    uint TransitionValue);
