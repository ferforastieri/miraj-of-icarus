using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Application.Common;
using MirajOfIcarus.Domain.Accounts;

namespace MirajOfIcarus.Application.Accounts;

public sealed class AccountService(
    IAccountRepository accounts,
    TimeProvider timeProvider)
{
    public async Task<ApplicationResult<Account>> RegisterAsync(
        string? requestedUserName,
        string? requestedPassword,
        CancellationToken cancellationToken = default)
    {
        var userName = NormalizeDisplayName(requestedUserName);
        if (userName is null)
        {
            return ApplicationResult.Failure<Account>(
                "invalid_account_name", ApplicationErrorType.Validation);
        }

        PasswordHashResult password;
        try
        {
            password = PasswordHasher.Hash(requestedPassword ?? string.Empty);
        }
        catch (ArgumentException)
        {
            return ApplicationResult.Failure<Account>(
                "invalid_password", ApplicationErrorType.Validation);
        }

        var account = new Account(
            userName,
            userName.ToUpperInvariant(),
            password.Hash,
            password.Salt,
            timeProvider.GetUtcNow());
        return await accounts.CreateAsync(account, cancellationToken)
            ? ApplicationResult.Success(account)
            : ApplicationResult.Failure<Account>(
                "account_name_unavailable", ApplicationErrorType.Conflict);
    }

    private static string? NormalizeDisplayName(string? requestedUserName)
    {
        if (string.IsNullOrWhiteSpace(requestedUserName)) return null;
        var value = requestedUserName.Trim();
        return value.Length is >= 3 and <= 32 && value.All(char.IsLetterOrDigit)
            ? value
            : null;
    }
}
