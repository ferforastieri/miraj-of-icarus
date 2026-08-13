using System.Globalization;
using System.Security.Claims;
using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Domain.Accounts;

namespace MirajOfIcarus.Api.Authentication;

public static class ClaimsPrincipalExtensions
{
    public static AccountIdentity GetAccount(this ClaimsPrincipal principal)
    {
        var accountId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = principal.FindFirstValue(ClaimTypes.Name);
        var role = principal.FindFirstValue(ClaimTypes.Role);
        var status = principal.FindFirstValue("account_status");
        if (!long.TryParse(accountId, NumberStyles.None, CultureInfo.InvariantCulture, out var id) ||
            string.IsNullOrWhiteSpace(userName) ||
            !Enum.TryParse<AccountRole>(role, out var parsedRole) ||
            !Enum.TryParse<AccountStatus>(status, out var parsedStatus))
        {
            throw new InvalidOperationException("The authenticated account claims are invalid.");
        }

        return new AccountIdentity(id, userName, parsedRole, parsedStatus);
    }
}
