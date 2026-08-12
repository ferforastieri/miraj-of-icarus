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
    private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(30);

    [HttpPost("accounts")]
    public async Task<ActionResult<AccountResponse>> RegisterAsync(
        RegisterAccountRequest request,
        CancellationToken cancellationToken)
    {
        string userName;
        try
        {
            userName = NormalizeDisplayName(request.UserName);
        }
        catch (ArgumentException)
        {
            return BadRequest(new { error = "invalid_account_name" });
        }

        var normalized = userName.ToUpperInvariant();
        PasswordHashResult password;
        try
        {
            password = PasswordHasher.Hash(request.Password);
        }
        catch (ArgumentException)
        {
            return BadRequest(new { error = "invalid_password" });
        }
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

        return Ok(await IssueLoginAsync(account.Id, account.UserName, cancellationToken));
    }

    [HttpGet("auth/me")]
    public async Task<ActionResult<AccountResponse>> MeAsync(CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        return access is null
            ? Unauthorized(new { error = "invalid_access_token" })
            : Ok(new AccountResponse(access.AccountId, access.UserName));
    }

    [HttpPost("auth/refresh")]
    public async Task<ActionResult<LoginResponse>> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return Unauthorized(new { error = "invalid_refresh_token" });
        }

        var refresh = await tokens.ConsumeAsync<RefreshSession>(
            "refresh", request.RefreshToken, cancellationToken);
        if (refresh is null || refresh.ExpiresAt <= timeProvider.GetUtcNow())
        {
            return Unauthorized(new { error = "invalid_refresh_token" });
        }

        return Ok(await IssueLoginAsync(refresh.AccountId, refresh.UserName, cancellationToken));
    }

    [HttpPost("auth/logout")]
    public async Task<IActionResult> LogoutAsync(
        LogoutRequest request,
        CancellationToken cancellationToken)
    {
        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            await tokens.RevokeAsync("refresh", request.RefreshToken, cancellationToken);
        }
        return NoContent();
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

    internal async ValueTask<AccessSession?> AuthenticateAsync(CancellationToken cancellationToken)
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

    private async Task<LoginResponse> IssueLoginAsync(
        long accountId,
        string userName,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var expiresAt = now.Add(AccessLifetime);
        var refreshExpiresAt = now.Add(RefreshLifetime);
        var accessToken = await tokens.IssueAsync(
            "access", new AccessSession(accountId, userName, expiresAt),
            AccessLifetime, cancellationToken);
        var refreshToken = await tokens.IssueAsync(
            "refresh", new RefreshSession(accountId, userName, refreshExpiresAt),
            RefreshLifetime, cancellationToken);
        return new LoginResponse(
            accessToken,
            expiresAt,
            refreshToken,
            refreshExpiresAt,
            new AccountResponse(accountId, userName));
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

    private sealed record LoginTicket(
        long AccountId,
        string UserName,
        string ServerId,
        DateTimeOffset ExpiresAt);
}
