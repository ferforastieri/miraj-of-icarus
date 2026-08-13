using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Api.Tests.Support;

namespace MirajOfIcarus.Api.Tests.Authentication;

[Trait("Category", "Infrastructure")]
public sealed class SessionExpiryTests
{
    [Fact]
    public async Task AccessAndRefreshPayloadExpiryAreEnforced()
    {
        var clock = new AdjustableTimeProvider(
            new DateTimeOffset(2026, 8, 12, 12, 0, 0, TimeSpan.Zero));
        await using var factory = ApiTestSupport.CreateFactoryWithClock(clock);
        using var client = factory.CreateClient();
        var userName = $"Expiry{Guid.NewGuid():N}"[..20];

        try
        {
            var login = await ApiTestSupport.RegisterAndLoginAsync(client, userName);
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            clock.Advance(TimeSpan.FromMinutes(16));
            Assert.Equal(HttpStatusCode.Unauthorized,
                (await client.GetAsync("/v1/auth/me")).StatusCode);

            clock.Advance(TimeSpan.FromDays(31));
            using var expiredRefresh = await client.PostAsJsonAsync(
                "/v1/auth/refresh", new RefreshTokenRequest(login.RefreshToken));
            Assert.Equal(HttpStatusCode.Unauthorized, expiredRefresh.StatusCode);
        }
        finally
        {
            await ApiTestSupport.DeleteAccountAsync(factory, userName);
        }
    }
}
