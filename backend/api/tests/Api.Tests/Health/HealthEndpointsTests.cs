using System.Net;
using System.Net.Http.Json;
using MirajOfIcarus.Api.Contracts;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MirajOfIcarus.Api.Tests;

public sealed class HealthEndpointsTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client = factory.CreateClient();

    [Fact]
    public async Task LiveEndpointReturnsSuccess()
    {
        using var response = await client.GetAsync("/health/live");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task StatusEndpointIdentifiesTheService()
    {
        var status = await client.GetFromJsonAsync<ServiceStatusResponse>(
            "/api/v1/status");

        Assert.NotNull(status);
        Assert.Equal("miraj-of-icarus-api", status.Service);
        Assert.Equal("healthy", status.Status);
        Assert.NotEmpty(status.Version);
    }
}
