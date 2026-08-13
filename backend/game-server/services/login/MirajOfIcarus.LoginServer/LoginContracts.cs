namespace MirajOfIcarus.LoginServer;

public sealed record OpenLoginSessionRequest(string Ticket);

public sealed record AdmissionRequest(long AccountId, string UserName, string ServerId);

public sealed record AdmissionResponse(
    uint SessionId,
    string LobbyEndpoint,
    string LobbyTicket,
    DateTimeOffset ExpiresAt);
