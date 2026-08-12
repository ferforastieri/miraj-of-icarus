using Masicarus.Game.Contracts;
using Npgsql;

namespace Masicarus.LobbyServer;

public static class LobbyDatabase
{
    public static async Task MigrateAsync(
        NpgsqlDataSource dataSource,
        CancellationToken cancellationToken = default)
    {
        const string migration = """
            CREATE TABLE IF NOT EXISTS game_characters (
                id uuid PRIMARY KEY,
                account_id bigint NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
                name varchar(24) NOT NULL,
                normalized_name varchar(24) NOT NULL UNIQUE,
                archetype varchar(16) NOT NULL,
                gender varchar(8) NOT NULL,
                customization jsonb NOT NULL,
                level integer NOT NULL DEFAULT 1,
                created_at timestamptz NOT NULL,
                deletion_scheduled_at timestamptz NULL
            );
            ALTER TABLE game_characters
                ADD COLUMN IF NOT EXISTS deletion_scheduled_at timestamptz NULL;
            CREATE INDEX IF NOT EXISTS ix_game_characters_account_id
                ON game_characters(account_id);
            """;

        await using var command = dataSource.CreateCommand(migration);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}

public sealed class CharacterRepository(NpgsqlDataSource dataSource)
{
    public async Task<IReadOnlyList<CharacterResponse>> ListAsync(
        long accountId,
        CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT id, name, archetype, gender, customization::text, level, created_at
            FROM game_characters
            WHERE account_id = $1 AND deletion_scheduled_at IS NULL
            ORDER BY created_at, id;
            """;
        await using var command = dataSource.CreateCommand(sql);
        command.Parameters.AddWithValue(accountId);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var characters = new List<CharacterResponse>();
        while (await reader.ReadAsync(cancellationToken))
        {
            characters.Add(new CharacterResponse(
                reader.GetGuid(0),
                reader.GetString(1),
                reader.GetString(2),
                reader.GetString(3),
                reader.GetString(4),
                reader.GetInt32(5),
                reader.GetFieldValue<DateTimeOffset>(6)));
        }

        return characters;
    }

    public async Task<CreateCharacterResult> CreateAsync(
        long accountId,
        CreateCharacterRequest request,
        DateTimeOffset createdAt,
        CancellationToken cancellationToken = default)
    {
        await using var connection = await dataSource.OpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await using (var lockCommand = new NpgsqlCommand(
            "SELECT pg_advisory_xact_lock($1);",
            connection,
            transaction))
        {
            lockCommand.Parameters.AddWithValue(accountId);
            await lockCommand.ExecuteNonQueryAsync(cancellationToken);
        }

        await using (var countCommand = new NpgsqlCommand(
            "SELECT count(*) FROM game_characters WHERE account_id = $1;",
            connection,
            transaction))
        {
            countCommand.Parameters.AddWithValue(accountId);
            var count = (long)(await countCommand.ExecuteScalarAsync(cancellationToken) ?? 0L);
            if (count >= CharacterRules.MaximumCharactersPerAccount)
            {
                return new CreateCharacterResult(CreateCharacterStatus.SlotsFull, null);
            }
        }

        var character = new CharacterResponse(
            Guid.NewGuid(),
            request.Name,
            request.Archetype,
            request.Gender,
            request.Customization,
            1,
            createdAt);
        const string insert = """
            INSERT INTO game_characters
                (id, account_id, name, normalized_name, archetype, gender,
                 customization, level, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9);
            """;
        await using var insertCommand = new NpgsqlCommand(insert, connection, transaction);
        insertCommand.Parameters.AddWithValue(character.Id);
        insertCommand.Parameters.AddWithValue(accountId);
        insertCommand.Parameters.AddWithValue(character.Name);
        insertCommand.Parameters.AddWithValue(character.Name.ToUpperInvariant());
        insertCommand.Parameters.AddWithValue(character.Archetype);
        insertCommand.Parameters.AddWithValue(character.Gender);
        insertCommand.Parameters.AddWithValue(character.Customization);
        insertCommand.Parameters.AddWithValue(character.Level);
        insertCommand.Parameters.AddWithValue(character.CreatedAt);

        try
        {
            await insertCommand.ExecuteNonQueryAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new CreateCharacterResult(CreateCharacterStatus.Created, character);
        }
        catch (PostgresException exception) when (exception.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            return new CreateCharacterResult(CreateCharacterStatus.NameUnavailable, null);
        }
    }
}

public enum CreateCharacterStatus
{
    Created,
    NameUnavailable,
    SlotsFull,
}

public sealed record CreateCharacterResult(
    CreateCharacterStatus Status,
    CharacterResponse? Character);

public sealed record CreateCharacterRequest(
    string Name,
    string Archetype,
    string Gender,
    string Customization);

public sealed record CharacterResponse(
    Guid Id,
    string Name,
    string Archetype,
    string Gender,
    string Customization,
    int Level,
    DateTimeOffset CreatedAt);
