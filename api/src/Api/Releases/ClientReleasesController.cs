using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Releases;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Releases;

[ApiController]
[Route("v1/client-releases/windows")]
public sealed class ClientReleasesController(ClientReleaseService releases)
    : ControllerBase
{
    [HttpGet("latest")]
    [ProducesResponseType<ClientReleaseResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<ClientReleaseResponse>> GetLatestAsync(
        CancellationToken cancellationToken)
    {
        var result = await releases.GetLatestAsync(cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);

        var release = result.Value!;
        Response.Headers.CacheControl = "no-store";
        return Ok(new ClientReleaseResponse(
            release.Version,
            release.TotalSize,
            release.ManifestUrl,
            release.SignatureUrl,
            release.FilesBaseUrl,
            release.LauncherUrl,
            release.PublishedAt));
    }
}
