using System.Text.Json;
using Masicarus.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Masicarus.Api.Controllers;

[ApiController]
[Route("v1/client-releases/windows")]
public sealed class ClientReleasesController(IConfiguration configuration) : ControllerBase
{
    private static readonly JsonSerializerOptions WebJsonOptions =
        new(JsonSerializerDefaults.Web);

    private const string ManifestName = "release-manifest.json";
    private const string SignatureName = "release-manifest.sig";

    private readonly string releaseRoot = Path.GetFullPath(
        configuration["ClientReleases:Root"] ?? "/srv/client-releases");

    [HttpGet("latest")]
    [ProducesResponseType<ClientReleaseResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ClientReleaseResponse>> GetLatestAsync(
        CancellationToken cancellationToken)
    {
        var metadataPath = Path.Combine(releaseRoot, "current", "release-metadata.json");
        if (!System.IO.File.Exists(metadataPath))
        {
            return NotFound(new { error = "client_release_unavailable" });
        }

        await using var stream = System.IO.File.OpenRead(metadataPath);
        var metadata = await JsonSerializer.DeserializeAsync<ClientReleaseMetadata>(
            stream, WebJsonOptions, cancellationToken);
        if (metadata is null || !IsVersion(metadata.Version) || metadata.TotalSize <= 0)
        {
            throw new InvalidDataException("Published client release metadata is invalid.");
        }

        Response.Headers.CacheControl = "no-store";
        var root = $"/v1/client-releases/windows/{metadata.Version}";
        return Ok(new ClientReleaseResponse(
            metadata.Version,
            metadata.TotalSize,
            $"{root}/{ManifestName}",
            $"{root}/{SignatureName}",
            $"{root}/files/"));
    }

    [HttpGet("{version}/{fileName}")]
    public IActionResult GetMetadata(string version, string fileName)
    {
        if (fileName is not (ManifestName or SignatureName))
        {
            return NotFound();
        }
        return SendImmutableFile(version, fileName,
            fileName == ManifestName ? "application/json" : "application/octet-stream");
    }

    [HttpGet("{version}/files/{**relativePath}")]
    public IActionResult GetFile(string version, string relativePath) =>
        SendImmutableFile(version, relativePath, "application/octet-stream");

    private IActionResult SendImmutableFile(string version, string relativePath, string contentType)
    {
        if (!IsVersion(version) || string.IsNullOrWhiteSpace(relativePath))
        {
            return NotFound();
        }

        var versionRoot = Path.GetFullPath(Path.Combine(releaseRoot, version));
        var candidate = Path.GetFullPath(Path.Combine(versionRoot, relativePath));
        if (!candidate.StartsWith(versionRoot + Path.DirectorySeparatorChar,
                StringComparison.Ordinal) || !System.IO.File.Exists(candidate))
        {
            return NotFound();
        }

        Response.Headers.CacheControl = "public,max-age=31536000,immutable";
        return PhysicalFile(candidate, contentType, enableRangeProcessing: true);
    }

    private static bool IsVersion(string? value) =>
        value is { Length: 40 } && value.All(character =>
            character is >= '0' and <= '9' or >= 'a' and <= 'f');
}
