using MirajOfIcarus.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Status;

[ApiController]
[Route("api/v1/status")]
public sealed class StatusController : ControllerBase
{
    [HttpGet]
    [ProducesResponseType<ServiceStatusResponse>(StatusCodes.Status200OK)]
    public ActionResult<ServiceStatusResponse> Get()
    {
        var version = typeof(Program).Assembly.GetName().Version?.ToString()
            ?? "unknown";

        return Ok(new ServiceStatusResponse(
            Service: "miraj-of-icarus-api",
            Status: "healthy",
            Version: version));
    }
}
