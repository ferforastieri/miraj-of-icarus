using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Domain.Characters;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace MirajOfIcarus.Infrastructure.Characters;

public sealed class CharacterRepository(
    IDbContextFactory<PlatformDbContext> databaseFactory) : ICharacterRepository
{
    public async Task<IReadOnlyList<Character>> ListAsync(
        long accountId,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Characters
            .AsNoTracking()
            .Where(character => character.AccountId == accountId)
            .OrderBy(character => character.CreatedAt)
            .ToArrayAsync(cancellationToken);
    }

    public async Task<CharacterCreationResult> CreateAsync(
        Character character,
        int maximumCharacters,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
        await database.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock({character.AccountId})", cancellationToken);
        var count = await database.Characters.CountAsync(
            value => value.AccountId == character.AccountId, cancellationToken);
        if (count >= maximumCharacters)
        {
            return new CharacterCreationResult(CharacterCreationStatus.SlotsFull, null);
        }

        database.Characters.Add(character);
        try
        {
            await database.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return new CharacterCreationResult(CharacterCreationStatus.Created, character);
        }
        catch (DbUpdateException exception)
            when (exception.InnerException is PostgresException
            {
                SqlState: PostgresErrorCodes.UniqueViolation
            })
        {
            return new CharacterCreationResult(CharacterCreationStatus.NameUnavailable, null);
        }
    }

    public async Task<Character?> ScheduleDeletionAsync(
        long accountId,
        Guid characterId,
        DateTimeOffset deletionScheduledAt,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var character = await FindOwnedAsync(
            database, accountId, characterId, cancellationToken);
        if (character is null) return null;
        character.ScheduleDeletion(deletionScheduledAt);
        await database.SaveChangesAsync(cancellationToken);
        return character;
    }

    public async Task<Character?> RestoreAsync(
        long accountId,
        Guid characterId,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var character = await FindOwnedAsync(
            database, accountId, characterId, cancellationToken);
        if (character is null) return null;
        character.Restore();
        await database.SaveChangesAsync(cancellationToken);
        return character;
    }

    public async Task<int> DeleteExpiredAsync(
        DateTimeOffset now,
        CancellationToken cancellationToken = default)
    {
        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        return await database.Characters
            .Where(character => character.DeletionScheduledAt <= now)
            .ExecuteDeleteAsync(cancellationToken);
    }

    private static Task<Character?> FindOwnedAsync(
        PlatformDbContext database,
        long accountId,
        Guid characterId,
        CancellationToken cancellationToken) =>
        database.Characters.SingleOrDefaultAsync(
            character => character.Id == characterId && character.AccountId == accountId,
            cancellationToken);
}
