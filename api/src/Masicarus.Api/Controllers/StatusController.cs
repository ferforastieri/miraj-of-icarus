using Masicarus.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Masicarus.Api.Controllers;

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
            Service: "masicarus-api",
            Status: "healthy",
            Version: version));
    }
}
