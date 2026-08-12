using Masicarus.Api.Common;
using Masicarus.Api.Contracts;
using Masicarus.Application.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ApplicationAuthenticationService = Masicarus.Application.Authentication.AuthenticationService;

namespace Masicarus.Api.Authentication;

[ApiController]
[Route("v1/auth")]
public sealed class AuthenticationController(ApplicationAuthenticationService authentication)
    : ControllerBase
{
    [HttpPost("login")]
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
    public ActionResult<AccountResponse> Me()
    {
        var account = User.GetAccount();
        return Ok(new AccountResponse(account.AccountId, account.UserName));
    }

    [HttpPost("refresh")]
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
        new AccountResponse(session.Account.AccountId, session.Account.UserName));
}
