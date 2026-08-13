using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Api.Security;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Accounts;

[ApiController]
[Route("v1/accounts")]
public sealed class AccountsController(
    AccountService accounts,
    TurnstileVerifier turnstile) : ControllerBase
{
    [HttpPost]
    [RateLimit("register")]
    public async Task<ActionResult<AccountResponse>> RegisterAsync(
        RegisterAccountRequest request,
        CancellationToken cancellationToken)
    {
        if (!await turnstile.VerifyAsync(
            request.TurnstileToken,
            Request.Headers["CF-Connecting-IP"].FirstOrDefault()
                ?? HttpContext.Connection.RemoteIpAddress?.ToString(),
            cancellationToken))
        {
            return BadRequest(new ErrorResponse("turnstile_failed"));
        }
        var result = await accounts.RegisterAsync(
            request.UserName, request.Password, cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);

        var account = result.Value!;
        return Created(
            $"/v1/accounts/{account.Id}",
            new AccountResponse(
                account.Id, account.UserName, account.Role.ToString(), account.Status.ToString()));
    }
}
