using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Masicarus.Api.Contracts;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Masicarus.Api.Tests;

public sealed class ClientReleaseEndpointsTests : IDisposable
{
    private static readonly JsonSerializerOptions WebJsonOptions =
        new(JsonSerializerDefaults.Web);

    private const string Version = "0123456789abcdef0123456789abcdef01234567";
    private readonly string releaseRoot = Path.Combine(
        Path.GetTempPath(), $"masicarus-release-tests-{Guid.NewGuid():N}");

    [Fact]
    public async Task LatestAndImmutableFilesExposePublishedReleaseAsync()
    {
        var versionRoot = Path.Combine(releaseRoot, Version);
        Directory.CreateDirectory(versionRoot);
        await File.WriteAllTextAsync(Path.Combine(versionRoot, "release-manifest.json"), "{\"files\":[]}");
        await File.WriteAllBytesAsync(Path.Combine(versionRoot, "release-manifest.sig"), [1, 2, 3]);
        await File.WriteAllTextAsync(Path.Combine(versionRoot, "MasicarusClient.exe"), "client");
        Directory.CreateSymbolicLink(Path.Combine(releaseRoot, "current"), versionRoot);
        await File.WriteAllTextAsync(
            Path.Combine(versionRoot, "release-metadata.json"),
            JsonSerializer.Serialize(
                new ClientReleaseMetadata(Version, 6),
                WebJsonOptions));

        await using var factory = CreateFactory();
        using var client = factory.CreateClient();
        var latest = await client.GetFromJsonAsync<ClientReleaseResponse>(
            "/v1/client-releases/windows/latest");

        Assert.NotNull(latest);
        Assert.Equal(Version, latest.Version);
        Assert.Equal(6, latest.TotalSize);
        Assert.Equal($"/v1/client-releases/windows/{Version}/files/", latest.FilesBaseUrl);
        using var file = await client.GetAsync(latest.FilesBaseUrl + "MasicarusClient.exe");
        Assert.Equal(HttpStatusCode.OK, file.StatusCode);
        Assert.Equal("client", await file.Content.ReadAsStringAsync());
        Assert.Contains("immutable", file.Headers.CacheControl?.Extensions.Select(value => value.Name) ?? []);
    }

    [Theory]
    [InlineData("../release-metadata.json")]
    [InlineData("%2e%2e/release-metadata.json")]
    public async Task FileRouteRejectsTraversalAsync(string path)
    {
        Directory.CreateDirectory(Path.Combine(releaseRoot, Version));
        await using var factory = CreateFactory();
        using var client = factory.CreateClient(new() { AllowAutoRedirect = false });

        using var response = await client.GetAsync(
            $"/v1/client-releases/windows/{Version}/files/{path}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private WebApplicationFactory<Program> CreateFactory() =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.ConfigureAppConfiguration((_, configuration) =>
                configuration.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["ClientReleases:Root"] = releaseRoot,
                    ["Database:ApplyMigrations"] = "false",
                })));

    public void Dispose()
    {
        if (Directory.Exists(releaseRoot)) Directory.Delete(releaseRoot, recursive: true);
        GC.SuppressFinalize(this);
    }
}
