using System.Net;
using System.Text.Json;
using Masicarus.Api.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace Masicarus.Api.Controllers;

[ApiController]
[Route("v1/client-releases/windows")]
public sealed class ClientReleasesController(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) : ControllerBase
{
    private static readonly JsonSerializerOptions WebJsonOptions = new(JsonSerializerDefaults.Web);

    [HttpGet("latest")]
    [ProducesResponseType<ClientReleaseResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status503ServiceUnavailable)]
    public async Task<ActionResult<ClientReleaseResponse>> GetLatestAsync(
        CancellationToken cancellationToken)
    {
        var configuredUrl = configuration["ClientReleases:ChannelManifestUrl"];
        if (!Uri.TryCreate(configuredUrl, UriKind.Absolute, out var channelUri))
        {
            return NotFound(new { error = "client_release_unavailable" });
        }

        try
        {
            using var response = await httpClientFactory.CreateClient("client-releases")
                .GetAsync(channelUri, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return NotFound(new { error = "client_release_unavailable" });
            }
            if (!response.IsSuccessStatusCode)
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { error = "client_release_service_unavailable" });
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var channel = await JsonSerializer.DeserializeAsync<ClientReleaseChannel>(
                stream, WebJsonOptions, cancellationToken);
            if (channel is null || !IsVersion(channel.Version) || channel.TotalSize <= 0 ||
                !IsPublicHttpsUrl(channel.ManifestUrl) ||
                !IsPublicHttpsUrl(channel.SignatureUrl) ||
                !IsPublicHttpsUrl(channel.FilesBaseUrl) ||
                !IsPublicHttpsUrl(channel.LauncherUrl))
            {
                return StatusCode(StatusCodes.Status503ServiceUnavailable,
                    new { error = "invalid_client_release" });
            }

            Response.Headers.CacheControl = "no-store";
            return Ok(new ClientReleaseResponse(
                channel.Version,
                channel.TotalSize,
                channel.ManifestUrl,
                channel.SignatureUrl,
                channel.FilesBaseUrl,
                channel.LauncherUrl,
                channel.PublishedAt));
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "client_release_service_unavailable" });
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { error = "client_release_service_unavailable" });
        }
    }

    private static bool IsVersion(string? value) =>
        value is { Length: 40 } && value.All(character =>
            character is >= '0' and <= '9' or >= 'a' and <= 'f');

    private static bool IsPublicHttpsUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps &&
        !string.IsNullOrWhiteSpace(uri.Host);
}
