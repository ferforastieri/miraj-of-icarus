using MirajOfIcarus.Api.Authentication;
using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.GameServers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MirajOfIcarus.Api.Security;

namespace MirajOfIcarus.Api.GameServers;

[ApiController]
[Authorize]
[Route("v1/game-tickets")]
public sealed class GameTicketsController(GameServerService servers) : ControllerBase
{
    [HttpPost]
    [RateLimit("game-ticket")]
    public async Task<ActionResult<GameTicketResponse>> IssueAsync(
        GameTicketRequest request,
        CancellationToken cancellationToken)
    {
        var result = await servers.IssueTicketAsync(
            User.GetAccount(), request.ServerId, cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);
        var ticket = result.Value!;
        return Ok(new GameTicketResponse(
            ticket.Ticket, ticket.ExpiresAt, ticket.Server.ToResponse()));
    }
}
