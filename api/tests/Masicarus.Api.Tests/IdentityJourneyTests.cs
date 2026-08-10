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

            var servers = await client.GetFromJsonAsync<GameServerResponse[]>("/v1/game-servers");
            var server = Assert.Single(servers!);
            Assert.True(server.Available);

            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            using var ticketMessage = await client.PostAsJsonAsync(
                "/v1/game-tickets",
                new GameTicketRequest(server.Id));
            ticketMessage.EnsureSuccessStatusCode();
            var ticket = await ticketMessage.Content.ReadFromJsonAsync<GameTicketResponse>();
            Assert.NotNull(ticket);
            Assert.Equal(server.Id, ticket.Server.Id);
            Assert.NotEmpty(ticket.Ticket);
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
