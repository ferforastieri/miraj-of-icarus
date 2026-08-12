using System.Security.Claims;
using System.Text.Encodings.Web;
using Masicarus.Api.Common;
using Masicarus.Application.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using ApplicationAuthenticationService = Masicarus.Application.Authentication.AuthenticationService;

namespace Masicarus.Api.Authentication;

public sealed class OpaqueBearerHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    ApplicationAuthenticationService authentication)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";
        if (!header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.NoResult();
        }

        var account = await authentication.ValidateAccessTokenAsync(
            header[prefix.Length..].Trim(), Context.RequestAborted);
        if (account is null)
        {
            return AuthenticateResult.Fail("Invalid access token.");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier,
                account.AccountId.ToString(System.Globalization.CultureInfo.InvariantCulture)),
            new Claim(ClaimTypes.Name, account.UserName),
        };
        var principal = new ClaimsPrincipal(
            new ClaimsIdentity(claims, OpaqueBearerDefaults.Scheme));
        return AuthenticateResult.Success(
            new AuthenticationTicket(principal, OpaqueBearerDefaults.Scheme));
    }

    protected override Task HandleChallengeAsync(AuthenticationProperties properties)
    {
        Response.StatusCode = StatusCodes.Status401Unauthorized;
        return Response.WriteAsJsonAsync(
            new ErrorResponse("invalid_access_token"), Context.RequestAborted);
    }
}
