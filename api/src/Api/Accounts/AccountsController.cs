using Masicarus.Api.Common;
using Masicarus.Api.Contracts;
using Masicarus.Application.Accounts;
using Microsoft.AspNetCore.Mvc;

namespace Masicarus.Api.Accounts;

[ApiController]
[Route("v1/accounts")]
public sealed class AccountsController(AccountService accounts) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<AccountResponse>> RegisterAsync(
        RegisterAccountRequest request,
        CancellationToken cancellationToken)
    {
        var result = await accounts.RegisterAsync(
            request.UserName, request.Password, cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);

        var account = result.Value!;
        return Created(
            $"/v1/accounts/{account.Id}",
            new AccountResponse(account.Id, account.UserName));
    }
}
