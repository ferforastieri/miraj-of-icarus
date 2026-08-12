using MirajOfIcarus.LobbyServer;
using Npgsql;
using NpgsqlTypes;

namespace MirajOfIcarus.LobbyServer.Tests;

[Trait("Category", "Infrastructure")]
public sealed class ScheduledCharacterTests
{
    [Fact]
    public async Task ScheduledCharactersAreHiddenFromGameSelection()
    {
        var connectionString = Environment.GetEnvironmentVariable("ConnectionStrings__Database")
            ?? throw new InvalidOperationException("ConnectionStrings__Database is required.");
        await using var dataSource = NpgsqlDataSource.Create(connectionString);
        await LobbyDatabase.MigrateAsync(dataSource);
        var suffix = Guid.NewGuid().ToString("N");
        long accountId;

        await using (var command = dataSource.CreateCommand("""
            INSERT INTO accounts
                (user_name, normalized_user_name, password_hash, password_salt, created_at)
            VALUES ($1, $2, 'test', 'test', now())
            RETURNING id;
            """))
        {
            command.Parameters.AddWithValue($"Lobby{suffix}"[..20]);
            command.Parameters.AddWithValue($"LOBBY{suffix}"[..20]);
            accountId = (long)(await command.ExecuteScalarAsync())!;
        }

        try
        {
            await InsertCharacterAsync(dataSource, accountId, $"Active{suffix}"[..20], null);
            await InsertCharacterAsync(
                dataSource,
                accountId,
                $"Blocked{suffix}"[..20],
                DateTimeOffset.UtcNow.AddDays(7));

            var visible = await new CharacterRepository(dataSource).ListAsync(accountId);

            var character = Assert.Single(visible);
            Assert.StartsWith("Active", character.Name, StringComparison.Ordinal);
        }
        finally
        {
            await using var cleanup = dataSource.CreateCommand(
                "DELETE FROM accounts WHERE id = $1;");
            cleanup.Parameters.AddWithValue(accountId);
            await cleanup.ExecuteNonQueryAsync();
        }
    }

    private static async Task InsertCharacterAsync(
        NpgsqlDataSource dataSource,
        long accountId,
        string name,
        DateTimeOffset? deletionScheduledAt)
    {
        await using var command = dataSource.CreateCommand("""
            INSERT INTO game_characters
                (id, account_id, name, normalized_name, archetype, gender,
                 customization, level, created_at, deletion_scheduled_at)
            VALUES ($1, $2, $3, $4, 'warrior', 'male', '{}'::jsonb, 1, now(), $5);
            """);
        command.Parameters.AddWithValue(Guid.NewGuid());
        command.Parameters.AddWithValue(accountId);
        command.Parameters.AddWithValue(name);
        command.Parameters.AddWithValue(name.ToUpperInvariant());
        command.Parameters.Add(new NpgsqlParameter
        {
            NpgsqlDbType = NpgsqlDbType.TimestampTz,
            Value = (object?)deletionScheduledAt ?? DBNull.Value
        });
        await command.ExecuteNonQueryAsync();
    }
}
