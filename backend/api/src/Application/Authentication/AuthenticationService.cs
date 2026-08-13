using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Application.Common;
using MirajOfIcarus.Domain.Accounts;

namespace MirajOfIcarus.Application.Authentication;

public sealed class AuthenticationService(
    IAccountRepository accounts,
    ITokenStore tokens,
    TimeProvider timeProvider)
{
    private static readonly TimeSpan AccessLifetime = TimeSpan.FromMinutes(15);
    private static readonly TimeSpan RefreshLifetime = TimeSpan.FromDays(30);

    public async Task<ApplicationResult<LoginSession>> LoginAsync(
        string? requestedUserName,
        string? password,
        CancellationToken cancellationToken = default)
    {
        var normalized = requestedUserName?.Trim().ToUpperInvariant();
        var account = string.IsNullOrEmpty(normalized)
            ? null
            : await accounts.FindByNormalizedUserNameAsync(normalized, cancellationToken);
        if (account is null ||
            !PasswordHasher.Verify(password ?? string.Empty, account.PasswordHash, account.PasswordSalt))
        {
            return ApplicationResult.Failure<LoginSession>(
                "invalid_credentials", ApplicationErrorType.Unauthorized);
        }

        if (account.Status == AccountStatus.Suspended)
        {
            return ApplicationResult.Failure<LoginSession>(
                "account_suspended", ApplicationErrorType.Unauthorized);
        }

        return ApplicationResult.Success(
            await IssueLoginAsync(account, cancellationToken));
    }

    public async Task<ApplicationResult<LoginSession>> RefreshAsync(
        string? refreshToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            return InvalidRefresh();
        }

        var refresh = await tokens.ConsumeAsync<RefreshSession>(
            "refresh", refreshToken, cancellationToken);
        if (refresh is null || refresh.ExpiresAt <= timeProvider.GetUtcNow())
        {
            return InvalidRefresh();
        }

        var account = await accounts.FindByIdAsync(refresh.AccountId, cancellationToken);
        if (account is null || account.Status == AccountStatus.Suspended)
        {
            await tokens.RevokeAccountAsync(refresh.AccountId, cancellationToken);
            return InvalidRefresh();
        }

        return ApplicationResult.Success(await IssueLoginAsync(account, cancellationToken));
    }

    public async ValueTask LogoutAsync(
        string? refreshToken,
        CancellationToken cancellationToken = default)
    {
        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            await tokens.RevokeAsync("refresh", refreshToken, cancellationToken);
        }
    }

    public async ValueTask<AccountIdentity?> ValidateAccessTokenAsync(
        string? accessToken,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(accessToken)) return null;
        var access = await tokens.ReadAsync<AccessSession>(
            "access", accessToken, cancellationToken);
        if (access is null || access.ExpiresAt <= timeProvider.GetUtcNow()) return null;
        var account = await accounts.FindByIdAsync(access.AccountId, cancellationToken);
        return account is { Status: AccountStatus.Active }
            ? new AccountIdentity(account.Id, account.UserName, account.Role, account.Status)
            : null;
    }

    private async Task<LoginSession> IssueLoginAsync(
        Account account,
        CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        var expiresAt = now.Add(AccessLifetime);
        var refreshExpiresAt = now.Add(RefreshLifetime);
        var accessToken = await tokens.IssueAsync(
            "access", new AccessSession(
                account.Id, account.UserName, account.Role, account.Status, expiresAt),
            AccessLifetime, cancellationToken);
        var refreshToken = await tokens.IssueAsync(
            "refresh", new RefreshSession(account.Id, account.UserName, refreshExpiresAt),
            RefreshLifetime, cancellationToken);
        return new LoginSession(
            accessToken,
            expiresAt,
            refreshToken,
            refreshExpiresAt,
            new AccountIdentity(account.Id, account.UserName, account.Role, account.Status));
    }

    private static ApplicationResult<LoginSession> InvalidRefresh() =>
        ApplicationResult.Failure<LoginSession>(
            "invalid_refresh_token", ApplicationErrorType.Unauthorized);
}
