using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.GameServers;
using Microsoft.AspNetCore.Mvc;
using MirajOfIcarus.Api.Security;

namespace MirajOfIcarus.Api.GameServers;

[ApiController]
[Route("v1/game-servers")]
public sealed class GameServersController(GameServerService servers) : ControllerBase
{
    [HttpGet]
    [RateLimit("public-read")]
    public async Task<ActionResult<IReadOnlyList<GameServerResponse>>> List(
        CancellationToken cancellationToken) =>
        Ok((await servers.GetAllAsync(cancellationToken)).Select(server => server.ToResponse()).ToArray());
}
