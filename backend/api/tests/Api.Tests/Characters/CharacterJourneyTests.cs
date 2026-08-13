using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Api.Tests.Support;
using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace MirajOfIcarus.Api.Tests.Characters;

[Trait("Category", "Infrastructure")]
public sealed class CharacterJourneyTests(
    WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task ScheduledDeletionCanBeRestoredByThePortalContract()
    {
        using var client = factory.CreateClient();
        var userName = $"Restore{Guid.NewGuid():N}"[..20];

        try
        {
            var login = await ApiTestSupport.RegisterAndLoginAsync(client, userName);
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            using var creation = await ApiTestSupport.CreateCharacterAsync(
                client, $"Hero{Guid.NewGuid():N}"[..20]);
            creation.EnsureSuccessStatusCode();
            var character = await creation.Content.ReadFromJsonAsync<CharacterResponse>();

            using var deletion = await client.DeleteAsync(
                $"/v1/account/characters/{character!.Id}");
            Assert.Equal(HttpStatusCode.Accepted, deletion.StatusCode);
            using var restoration = await client.PostAsJsonAsync(
                $"/v1/account/characters/{character.Id}/restore", new { });
            restoration.EnsureSuccessStatusCode();
            var restored = await restoration.Content.ReadFromJsonAsync<CharacterResponse>();
            Assert.Null(restored?.DeletionScheduledAt);
        }
        finally
        {
            await ApiTestSupport.DeleteAccountAsync(factory, userName);
        }
    }

    [Fact]
    public async Task NamesRemainReservedAndConcurrentCreationHonorsFourSlots()
    {
        using var client = factory.CreateClient();
        var userName = $"Slots{Guid.NewGuid():N}"[..20];

        try
        {
            var login = await ApiTestSupport.RegisterAndLoginAsync(client, userName);
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);

            var firstName = $"Hero{Guid.NewGuid():N}"[..20];
            using var first = await ApiTestSupport.CreateCharacterAsync(client, firstName);
            Assert.True(first.StatusCode == HttpStatusCode.Created,
                await first.Content.ReadAsStringAsync());
            using var duplicate = await ApiTestSupport.CreateCharacterAsync(
                client, firstName.ToUpperInvariant());
            Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);

            using var second = await ApiTestSupport.CreateCharacterAsync(
                client, $"Mage{Guid.NewGuid():N}"[..20]);
            using var third = await ApiTestSupport.CreateCharacterAsync(
                client, $"Guard{Guid.NewGuid():N}"[..20]);
            Assert.Equal(HttpStatusCode.Created, second.StatusCode);
            Assert.Equal(HttpStatusCode.Created, third.StatusCode);

            var concurrent = await Task.WhenAll(
                ApiTestSupport.CreateCharacterAsync(client, $"Priest{Guid.NewGuid():N}"[..20]),
                ApiTestSupport.CreateCharacterAsync(client, $"Rogue{Guid.NewGuid():N}"[..20]));
            try
            {
                Assert.Single(concurrent,
                    response => response.StatusCode == HttpStatusCode.Created);
                Assert.Single(concurrent,
                    response => response.StatusCode == HttpStatusCode.Conflict);
            }
            finally
            {
                foreach (var response in concurrent) response.Dispose();
            }

            var characters = await client.GetFromJsonAsync<CharacterResponse[]>(
                "/v1/account/characters");
            Assert.Equal(4, characters?.Length);
            using var deletion = await client.DeleteAsync(
                $"/v1/account/characters/{characters![0].Id}");
            Assert.Equal(HttpStatusCode.Accepted, deletion.StatusCode);
            var reserved = await client.GetFromJsonAsync<CharacterResponse[]>(
                "/v1/account/characters");
            Assert.Equal(4, reserved?.Length);
            Assert.NotNull(reserved![0].DeletionScheduledAt);
            using var stillFull = await ApiTestSupport.CreateCharacterAsync(
                client, $"Later{Guid.NewGuid():N}"[..20]);
            Assert.Equal(HttpStatusCode.Conflict, stillFull.StatusCode);
        }
        finally
        {
            await ApiTestSupport.DeleteAccountAsync(factory, userName);
        }
    }

    [Fact]
    public async Task ExpiredScheduledCharacterIsPermanentlyRemoved()
    {
        var clock = new AdjustableTimeProvider(
            new DateTimeOffset(2026, 8, 12, 12, 0, 0, TimeSpan.Zero));
        await using var expiringFactory = ApiTestSupport.CreateFactoryWithClock(clock);
        using var client = expiringFactory.CreateClient();
        var userName = $"Purge{Guid.NewGuid():N}"[..20];

        try
        {
            var login = await ApiTestSupport.RegisterAndLoginAsync(client, userName);
            client.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", login.AccessToken);
            using var creation = await ApiTestSupport.CreateCharacterAsync(
                client, $"Old{Guid.NewGuid():N}"[..20]);
            var character = await creation.Content.ReadFromJsonAsync<CharacterResponse>();
            using var deletion = await client.DeleteAsync(
                $"/v1/account/characters/{character!.Id}");
            Assert.Equal(HttpStatusCode.Accepted, deletion.StatusCode);

            clock.Advance(TimeSpan.FromDays(7).Add(TimeSpan.FromSeconds(1)));
            await using var scope = expiringFactory.Services.CreateAsyncScope();
            var deletionService = scope.ServiceProvider
                .GetRequiredService<CharacterDeletionService>();
            Assert.Equal(1, await deletionService.DeleteExpiredAsync());

            var databaseFactory = scope.ServiceProvider
                .GetRequiredService<IDbContextFactory<PlatformDbContext>>();
            await using var database = await databaseFactory.CreateDbContextAsync();
            Assert.False(await database.Characters.AnyAsync(
                item => item.Id == character.Id));
        }
        finally
        {
            await ApiTestSupport.DeleteAccountAsync(expiringFactory, userName);
        }
    }
}
