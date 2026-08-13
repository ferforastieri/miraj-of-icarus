using System.Net.Http.Json;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;

namespace MirajOfIcarus.Api.Tests.Support;

internal static class ApiTestSupport
{
    public const string Password = "a test password with enough entropy";

    public static WebApplicationFactory<Program> CreateFactoryWithClock(TimeProvider clock) =>
        new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            builder.ConfigureServices(services =>
            {
                services.RemoveAll<TimeProvider>();
                services.RemoveAll<IHostedService>();
                services.AddSingleton(clock);
            }));

    public static async Task<LoginResponse> RegisterAndLoginAsync(
        HttpClient client,
        string userName)
    {
        client.DefaultRequestHeaders.Remove("CF-Connecting-IP");
        client.DefaultRequestHeaders.Add("CF-Connecting-IP",
            $"198.51.100.{Random.Shared.Next(1, 255)}");
        using var registration = await client.PostAsJsonAsync(
            "/v1/accounts", new RegisterAccountRequest(userName, Password));
        registration.EnsureSuccessStatusCode();
        using var login = await client.PostAsJsonAsync(
            "/v1/auth/login", new LoginRequest(userName, Password));
        login.EnsureSuccessStatusCode();
        return (await login.Content.ReadFromJsonAsync<LoginResponse>())!;
    }

    public static Task<HttpResponseMessage> CreateCharacterAsync(
        HttpClient client,
        string name) =>
        client.PostAsJsonAsync(
            "/v1/account/characters",
            new CreateCharacterRequest(name, "warrior", "male"));

    public static async Task DeleteAccountAsync(
        WebApplicationFactory<Program> factory,
        string userName)
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

internal sealed class AdjustableTimeProvider(DateTimeOffset value) : TimeProvider
{
    private DateTimeOffset current = value;

    public override DateTimeOffset GetUtcNow() => current;

    public void Advance(TimeSpan duration) => current = current.Add(duration);
}
