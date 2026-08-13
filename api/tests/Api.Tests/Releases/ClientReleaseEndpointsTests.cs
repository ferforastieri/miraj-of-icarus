using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Globalization;
using MirajOfIcarus.Api.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MirajOfIcarus.Api.Tests;

public sealed class ClientReleaseEndpointsTests
{
    private const string Version = "0123456789abcdef0123456789abcdef01234567";

    [Fact]
    public async Task LatestReleaseReturnsValidatedR2UrlsAsync()
    {
        var channel = new ClientReleaseChannel(
            Version,
            1234,
            $"https://downloads.mirajoficarus.com/releases/{Version}/client/release-manifest.json",
            $"https://downloads.mirajoficarus.com/releases/{Version}/client/release-manifest.sig",
            $"https://downloads.mirajoficarus.com/releases/{Version}/client/files/",
            $"https://downloads.mirajoficarus.com/releases/{Version}/launcher/MirajOfIcarusLauncher.exe",
            DateTimeOffset.Parse("2026-08-12T12:00:00Z", CultureInfo.InvariantCulture));
        await using var factory = CreateFactory(JsonSerializer.Serialize(channel));
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/v1/client-releases/windows/latest");
        response.EnsureSuccessStatusCode();
        var release = await response.Content.ReadFromJsonAsync<ClientReleaseResponse>();

        Assert.NotNull(release);
        Assert.Equal(Version, release.Version);
        Assert.Equal(channel.LauncherUrl, release.LauncherUrl);
        Assert.Equal("no-store", response.Headers.CacheControl?.ToString());
        var publicJson = await response.Content.ReadAsStringAsync();
        Assert.DoesNotContain("manifestUrl", publicJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("signatureUrl", publicJson, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("filesBaseUrl", publicJson, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task DownloadSessionRequiresAuthenticationAsync()
    {
        await using var factory = CreateFactory("{}");
        using var client = factory.CreateClient();

        using var response = await client.PostAsync(
            "/v1/client-releases/windows/download-session", null);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task InvalidChannelIsRejectedWithoutLeakingContentAsync()
    {
        await using var factory = CreateFactory("{\"version\":\"bad\"}");
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/v1/client-releases/windows/latest");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Theory]
    [InlineData(HttpStatusCode.NotFound, HttpStatusCode.NotFound)]
    [InlineData(HttpStatusCode.BadGateway, HttpStatusCode.ServiceUnavailable)]
    public async Task ChannelFailureReturnsStablePublicStatusAsync(
        HttpStatusCode channelStatus,
        HttpStatusCode expectedStatus)
    {
        await using var factory = CreateFactory("{}", channelStatus);
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/v1/client-releases/windows/latest");

        Assert.Equal(expectedStatus, response.StatusCode);
    }

    private static WebApplicationFactory<Program> CreateFactory(
        string channel,
        HttpStatusCode channelStatus = HttpStatusCode.OK) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureAppConfiguration((_, configuration) =>
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ClientReleases:ChannelManifestUrl"] = "https://channel.test/alpha.json",
                    ["Database:ApplyMigrations"] = "false",
                }));
            builder.ConfigureServices(services =>
                services.AddHttpClient("client-releases")
                    .ConfigurePrimaryHttpMessageHandler(() =>
                        new ChannelHandler(channel, channelStatus)));
        });

    private sealed class ChannelHandler(string channel, HttpStatusCode status) : HttpMessageHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken) =>
            Task.FromResult(new HttpResponseMessage(status)
            {
                RequestMessage = request,
                Content = new StringContent(channel, Encoding.UTF8, "application/json"),
            });
    }
}
