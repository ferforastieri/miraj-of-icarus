using System.Globalization;
using System.Security.Claims;
using MirajOfIcarus.Application.Authentication;

namespace MirajOfIcarus.Api.Authentication;

public static class ClaimsPrincipalExtensions
{
    public static AccountIdentity GetAccount(this ClaimsPrincipal principal)
    {
        var accountId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var userName = principal.FindFirstValue(ClaimTypes.Name);
        if (!long.TryParse(accountId, NumberStyles.None, CultureInfo.InvariantCulture, out var id) ||
            string.IsNullOrWhiteSpace(userName))
        {
            throw new InvalidOperationException("The authenticated account claims are invalid.");
        }

        return new AccountIdentity(id, userName);
    }
}
