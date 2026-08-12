using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Api.Tests.Support;
using Microsoft.AspNetCore.Mvc.Testing;

namespace MirajOfIcarus.Api.Tests.Authentication;

[Trait("Category", "Infrastructure")]
public sealed class AuthenticationJourneyTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task ProtectedEndpointsRejectRequestsWithoutAccessToken()
    {
        using var client = factory.CreateClient();

        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.GetAsync("/v1/auth/me")).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await client.GetAsync("/v1/account/characters")).StatusCode);
    }

    [Fact]
    public async Task RegisterLoginChooseServerAndIssueTicket()
    {
        using var client = factory.CreateClient();
        var userName = $"Test{Guid.NewGuid():N}"[..20];

        try
        {
            using var registration = await client.PostAsJsonAsync(
                "/v1/accounts",
                new RegisterAccountRequest(userName, ApiTestSupport.Password));
            Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

            using var rejected = await client.PostAsJsonAsync(
                "/v1/auth/login",
                new LoginRequest(userName, "definitely wrong"));
            Assert.Equal(HttpStatusCode.Unauthorized, rejected.StatusCode);

            using var loginMessage = await client.PostAsJsonAsync(
                "/v1/auth/login",
                new LoginRequest(userName, ApiTestSupport.Password));
            loginMessage.EnsureSuccessStatusCode();
            var login = await loginMessage.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.NotNull(login);
            Assert.Equal(userName, login.Account.UserName);
            Assert.NotEmpty(login.RefreshToken);

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            var account = await client.GetFromJsonAsync<AccountResponse>("/v1/auth/me");
            Assert.Equal(userName, account?.UserName);

            var servers = await client.GetFromJsonAsync<GameServerResponse[]>("/v1/game-servers");
            var server = Assert.Single(servers!);
            Assert.True(server.Available);
            using var ticketMessage = await client.PostAsJsonAsync(
                "/v1/game-tickets", new GameTicketRequest(server.Id));
            ticketMessage.EnsureSuccessStatusCode();
            var ticket = await ticketMessage.Content.ReadFromJsonAsync<GameTicketResponse>();
            Assert.NotNull(ticket);
            Assert.Equal(server.Id, ticket.Server.Id);
            Assert.NotEmpty(ticket.Ticket);

            using var refreshMessage = await client.PostAsJsonAsync(
                "/v1/auth/refresh", new RefreshTokenRequest(login.RefreshToken));
            refreshMessage.EnsureSuccessStatusCode();
            var refreshed = await refreshMessage.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.NotNull(refreshed);
            Assert.NotEqual(login.RefreshToken, refreshed.RefreshToken);

            using var replay = await client.PostAsJsonAsync(
                "/v1/auth/refresh", new RefreshTokenRequest(login.RefreshToken));
            Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);
            using var logout = await client.PostAsJsonAsync(
                "/v1/auth/logout", new LogoutRequest(refreshed.RefreshToken));
            Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);
            using var revoked = await client.PostAsJsonAsync(
                "/v1/auth/refresh", new RefreshTokenRequest(refreshed.RefreshToken));
            Assert.Equal(HttpStatusCode.Unauthorized, revoked.StatusCode);
        }
        finally
        {
            await ApiTestSupport.DeleteAccountAsync(factory, userName);
        }
    }
}
