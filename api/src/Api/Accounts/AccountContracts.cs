namespace Masicarus.Api.Contracts;

public sealed record RegisterAccountRequest(string UserName, string Password);

public sealed record AccountResponse(long AccountId, string UserName);
