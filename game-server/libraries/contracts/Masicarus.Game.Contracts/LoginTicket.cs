namespace Masicarus.Game.Contracts;

public sealed record LoginTicket(
    long AccountId,
    string UserName,
    string ServerId,
    DateTimeOffset ExpiresAt);
