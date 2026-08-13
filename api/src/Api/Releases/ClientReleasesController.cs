using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Releases;
using Microsoft.AspNetCore.Mvc;
using MirajOfIcarus.Api.Security;
using MirajOfIcarus.Api.Authentication;
using Microsoft.AspNetCore.Authorization;

namespace MirajOfIcarus.Api.Releases;

[ApiController]
[Route("v1/client-releases/windows")]
public sealed class ClientReleasesController(ClientReleaseService releases)
    : ControllerBase
{
    [HttpGet("latest")]
    [RateLimit("public-read")]
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
            release.LauncherUrl,
            release.PublishedAt));
    }

    [Authorize]
    [HttpPost("download-session")]
    [RateLimit("download")]
    public async Task<ActionResult<ClientDownloadSessionResponse>> CreateDownloadSessionAsync(
        [FromServices] ClientDownloadService downloads,
        CancellationToken cancellationToken)
    {
        var result = await downloads.CreateAsync(User.GetAccount(), cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);
        var session = result.Value!;
        return Ok(new ClientDownloadSessionResponse(
            session.Version, session.TotalSize, session.ManifestUrl, session.SignatureUrl,
            session.FilesBaseUrl, session.AccessToken, session.ExpiresAt));
    }
}
