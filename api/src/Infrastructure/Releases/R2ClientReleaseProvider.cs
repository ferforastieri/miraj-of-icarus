using System.Net;
using System.Text.Json;
using Masicarus.Application.Releases;
using Microsoft.Extensions.Configuration;

namespace Masicarus.Infrastructure.Releases;

public sealed class R2ClientReleaseProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) : IClientReleaseProvider
{
    private static readonly JsonSerializerOptions JsonOptions =
        new(JsonSerializerDefaults.Web);

    public async Task<ClientReleaseProviderResult> GetLatestAsync(
        CancellationToken cancellationToken = default)
    {
        if (!Uri.TryCreate(
            configuration["ClientReleases:ChannelManifestUrl"],
            UriKind.Absolute,
            out var channelUri))
        {
            return new ClientReleaseProviderResult(ClientReleaseProviderStatus.NotFound);
        }

        try
        {
            using var response = await httpClientFactory.CreateClient("client-releases")
                .GetAsync(channelUri, cancellationToken);
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return new ClientReleaseProviderResult(ClientReleaseProviderStatus.NotFound);
            }
            if (!response.IsSuccessStatusCode)
            {
                return new ClientReleaseProviderResult(ClientReleaseProviderStatus.Unavailable);
            }

            await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
            var release = await JsonSerializer.DeserializeAsync<ClientRelease>(
                stream, JsonOptions, cancellationToken);
            return new ClientReleaseProviderResult(
                ClientReleaseProviderStatus.Available, release);
        }
        catch (Exception exception) when (exception is HttpRequestException or JsonException)
        {
            return new ClientReleaseProviderResult(ClientReleaseProviderStatus.Unavailable);
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            return new ClientReleaseProviderResult(ClientReleaseProviderStatus.Unavailable);
        }
    }
}
