namespace MirajOfIcarus.LobbyServer;

public sealed record OpenLobbySessionRequest(string Ticket);

public sealed record OpenLobbySessionResponse(string SessionToken, DateTimeOffset ExpiresAt);
