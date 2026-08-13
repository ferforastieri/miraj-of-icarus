namespace MirajOfIcarus.Api.Contracts;

public sealed record RegisterAccountRequest(string UserName, string Password, string? TurnstileToken = null);

public sealed record AccountResponse(
    long AccountId,
    string UserName,
    string Role,
    string Status);
