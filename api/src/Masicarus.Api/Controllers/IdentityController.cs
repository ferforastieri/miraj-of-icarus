using Masicarus.Api.Contracts;
using Masicarus.Application.Identity;
using Masicarus.Domain.Identity;
using Masicarus.Infrastructure.Identity;
using Masicarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Masicarus.Api.Controllers;

[ApiController]
[Route("v1")]
public sealed class IdentityController(
    IDbContextFactory<PlatformDbContext> databaseFactory,
    OpaqueTokenStore tokens,
    IConfiguration configuration,
    TimeProvider timeProvider) : ControllerBase
{
    private static readonly TimeSpan AccessLifetime = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan GameTicketLifetime = TimeSpan.FromSeconds(60);

    [HttpPost("accounts")]
    public async Task<ActionResult<AccountResponse>> RegisterAsync(
        RegisterAccountRequest request,
        CancellationToken cancellationToken)
    {
        var userName = NormalizeDisplayName(request.UserName);
        var normalized = userName.ToUpperInvariant();
        var password = PasswordHasher.Hash(request.Password);
        var account = new Account(
            userName,
            normalized,
            password.Hash,
            password.Salt,
            timeProvider.GetUtcNow());

        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        database.Accounts.Add(account);
        try
        {
            await database.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { error = "account_name_unavailable" });
        }

        return Created(
            $"/v1/accounts/{account.Id}",
            new AccountResponse(account.Id, account.UserName));
    }

    [HttpPost("auth/login")]
    public async Task<ActionResult<LoginResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalized = request.UserName.Trim().ToUpperInvariant();
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var account = await database.Accounts
            .AsNoTracking()
            .SingleOrDefaultAsync(value => value.NormalizedUserName == normalized, cancellationToken);
        if (account is null ||
            !PasswordHasher.Verify(request.Password, account.PasswordHash, account.PasswordSalt))
        {
            return Unauthorized(new { error = "invalid_credentials" });
        }

        var expiresAt = timeProvider.GetUtcNow().Add(AccessLifetime);
        var accessToken = await tokens.IssueAsync(
            "access",
            new AccessSession(account.Id, account.UserName, expiresAt),
            AccessLifetime,
            cancellationToken);
        return Ok(new LoginResponse(
            accessToken,
            expiresAt,
            new AccountResponse(account.Id, account.UserName)));
    }

    [HttpGet("game-servers")]
    public ActionResult<IReadOnlyList<GameServerResponse>> GetServers() =>
        Ok(ReadServers());

    [HttpPost("game-tickets")]
    public async Task<ActionResult<GameTicketResponse>> IssueGameTicketAsync(
        GameTicketRequest request,
        CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        if (access is null)
        {
            return Unauthorized(new { error = "invalid_access_token" });
        }

        var server = ReadServers().SingleOrDefault(value => value.Id == request.ServerId);
        if (server is null || !server.Available)
        {
            return NotFound(new { error = "server_unavailable" });
        }

        var expiresAt = timeProvider.GetUtcNow().Add(GameTicketLifetime);
        var gameTicket = await tokens.IssueAsync(
            "login",
            new LoginTicket(access.AccountId, access.UserName, server.Id, expiresAt),
            GameTicketLifetime,
            cancellationToken);
        return Ok(new GameTicketResponse(gameTicket, expiresAt, server));
    }

    private async ValueTask<AccessSession?> AuthenticateAsync(CancellationToken cancellationToken)
    {
        var header = Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";
        if (!header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var access = await tokens.ReadAsync<AccessSession>(
            "access",
            header[prefix.Length..].Trim(),
            cancellationToken);
        return access is not null && access.ExpiresAt > timeProvider.GetUtcNow()
            ? access
            : null;
    }

    private GameServerResponse[] ReadServers()
    {
        var servers = configuration.GetSection("GameServers").Get<GameServerResponse[]>();
        return servers is { Length: > 0 }
            ? servers
            : throw new InvalidOperationException("GameServers must contain at least one server.");
    }

    private static string NormalizeDisplayName(string userName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);
        var value = userName.Trim();
        if (value.Length is < 3 or > 32 || value.Any(character => !char.IsLetterOrDigit(character)))
        {
            throw new ArgumentException(
                "Account names must contain 3 to 32 letters or numbers.",
                nameof(userName));
        }

        return value;
    }

    private sealed record AccessSession(
        long AccountId,
        string UserName,
        DateTimeOffset ExpiresAt);

    private sealed record LoginTicket(
        long AccountId,
        string UserName,
        string ServerId,
        DateTimeOffset ExpiresAt);
}
