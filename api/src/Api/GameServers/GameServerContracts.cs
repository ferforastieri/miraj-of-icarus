namespace Masicarus.Api.Contracts;

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
