using System.Net;
using System.Net.Http.Json;
using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Api.Tests.Support;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MirajOfIcarus.Api.Tests.Security;

[Trait("Category", "Infrastructure")]
public sealed class RateLimitJourneyTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task RegistrationLimitReturnsStableErrorAndRetryAfter()
    {
        using var client = factory.CreateClient();
        var suffix = Guid.NewGuid().ToString("N");
        var names = Enumerable.Range(0, 4)
            .Select(index => $"Rate{index}{suffix}"[..20])
            .ToArray();
        client.DefaultRequestHeaders.Add("CF-Connecting-IP",
            $"198.18.{Convert.ToByte(suffix[..2], 16)}.{Convert.ToByte(suffix[2..4], 16)}");

        try
        {
            for (var index = 0; index < 3; index++)
            {
                using var accepted = await client.PostAsJsonAsync(
                    "/v1/accounts",
                    new RegisterAccountRequest(names[index], ApiTestSupport.Password));
                Assert.Equal(HttpStatusCode.Created, accepted.StatusCode);
            }

            using var limited = await client.PostAsJsonAsync(
                "/v1/accounts",
                new RegisterAccountRequest(names[3], ApiTestSupport.Password));
            Assert.Equal(HttpStatusCode.TooManyRequests, limited.StatusCode);
            Assert.True(limited.Headers.RetryAfter?.Delta > TimeSpan.Zero);
            Assert.Equal("rate_limited",
                (await limited.Content.ReadFromJsonAsync<ErrorResponse>())?.Error);
        }
        finally
        {
            foreach (var name in names)
                await ApiTestSupport.DeleteAccountAsync(factory, name);
        }
    }
}
