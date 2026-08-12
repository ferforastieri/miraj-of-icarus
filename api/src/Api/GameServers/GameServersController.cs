using Masicarus.Api.Contracts;
using Masicarus.Application.GameServers;
using Microsoft.AspNetCore.Mvc;

namespace Masicarus.Api.GameServers;

[ApiController]
[Route("v1/game-servers")]
public sealed class GameServersController(GameServerService servers) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyList<GameServerResponse>> List() =>
        Ok(servers.GetAll().Select(server => server.ToResponse()).ToArray());
}
