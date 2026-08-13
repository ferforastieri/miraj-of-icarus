using Npgsql;

namespace MirajOfIcarus.LobbyServer;

public sealed class CharacterReadRepository(NpgsqlDataSource dataSource)
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
}

public sealed record CharacterResponse(
    Guid Id,
    string Name,
    string Archetype,
    string Gender,
    string Customization,
    int Level,
    DateTimeOffset CreatedAt);
