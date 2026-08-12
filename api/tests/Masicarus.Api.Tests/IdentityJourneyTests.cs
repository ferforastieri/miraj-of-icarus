using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Masicarus.Api.Contracts;
using Masicarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Masicarus.Api.Tests;

[Trait("Category", "Infrastructure")]
public sealed class IdentityJourneyTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task RegisterLoginChooseServerAndIssueTicket()
    {
        using var client = factory.CreateClient();
        var userName = $"Test{Guid.NewGuid():N}"[..20];
        const string password = "a test password with enough entropy";

        try
        {
            using var registration = await client.PostAsJsonAsync(
                "/v1/accounts",
                new RegisterAccountRequest(userName, password));
            Assert.Equal(HttpStatusCode.Created, registration.StatusCode);

            using var rejected = await client.PostAsJsonAsync(
                "/v1/auth/login",
                new LoginRequest(userName, "definitely wrong"));
            Assert.Equal(HttpStatusCode.Unauthorized, rejected.StatusCode);

            using var loginMessage = await client.PostAsJsonAsync(
                "/v1/auth/login",
                new LoginRequest(userName, password));
            loginMessage.EnsureSuccessStatusCode();
            var login = await loginMessage.Content.ReadFromJsonAsync<LoginResponse>();
            Assert.NotNull(login);
            Assert.Equal(userName, login.Account.UserName);
            Assert.NotEmpty(login.RefreshToken);

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            var account = await client.GetFromJsonAsync<AccountResponse>("/v1/auth/me");
            Assert.Equal(userName, account?.UserName);

            using var characterMessage = await client.PostAsJsonAsync(
                "/v1/account/characters",
                new CreateCharacterRequest($"Hero{Guid.NewGuid():N}"[..20], "warrior", "male"));
            characterMessage.EnsureSuccessStatusCode();
            var character = await characterMessage.Content.ReadFromJsonAsync<CharacterResponse>();
            Assert.NotNull(character);

            using var deletion = await client.DeleteAsync($"/v1/account/characters/{character.Id}");
            Assert.Equal(HttpStatusCode.Accepted, deletion.StatusCode);
            using var restoration = await client.PostAsJsonAsync(
                $"/v1/account/characters/{character.Id}/restore", new { });
            restoration.EnsureSuccessStatusCode();

            var servers = await client.GetFromJsonAsync<GameServerResponse[]>("/v1/game-servers");
            var server = Assert.Single(servers!);
            Assert.True(server.Available);

            using var ticketMessage = await client.PostAsJsonAsync(
                "/v1/game-tickets",
                new GameTicketRequest(server.Id));
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
            await using var scope = factory.Services.CreateAsyncScope();
            var databaseFactory = scope.ServiceProvider
                .GetRequiredService<IDbContextFactory<PlatformDbContext>>();
            await using var database = await databaseFactory.CreateDbContextAsync();
            await database.Accounts
                .Where(account => account.UserName == userName)
                .ExecuteDeleteAsync();
        }
    }
}
