using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApplicationAuthenticationService = MirajOfIcarus.Application.Authentication.AuthenticationService;
using MirajOfIcarus.Api.Security;

namespace MirajOfIcarus.Api.Authentication;

[ApiController]
[Route("v1/auth")]
public sealed class AuthenticationController(ApplicationAuthenticationService authentication)
    : ControllerBase
{
    [HttpPost("login")]
    [RateLimit("login")]
    public async Task<ActionResult<LoginResponse>> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authentication.LoginAsync(
            request.UserName, request.Password, cancellationToken);
        return result.Succeeded
            ? Ok(ToResponse(result.Value!))
            : this.ToActionResult(result.Error!);
    }

    [Authorize]
    [HttpGet("me")]
    [RateLimit("account-read")]
    public ActionResult<AccountResponse> Me()
    {
        var account = User.GetAccount();
        return Ok(new AccountResponse(
            account.AccountId, account.UserName, account.Role.ToString(), account.Status.ToString()));
    }

    [HttpPost("refresh")]
    [RateLimit("session")]
    public async Task<ActionResult<LoginResponse>> RefreshAsync(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var result = await authentication.RefreshAsync(
            request.RefreshToken, cancellationToken);
        return result.Succeeded
            ? Ok(ToResponse(result.Value!))
            : this.ToActionResult(result.Error!);
    }

    [HttpPost("logout")]
    [RateLimit("session")]
    public async Task<IActionResult> LogoutAsync(
        LogoutRequest request,
        CancellationToken cancellationToken)
    {
        await authentication.LogoutAsync(request.RefreshToken, cancellationToken);
        return NoContent();
    }

    private static LoginResponse ToResponse(LoginSession session) => new(
        session.AccessToken,
        session.ExpiresAt,
        session.RefreshToken,
        session.RefreshExpiresAt,
        new AccountResponse(
            session.Account.AccountId,
            session.Account.UserName,
            session.Account.Role.ToString(),
            session.Account.Status.ToString()));
}
