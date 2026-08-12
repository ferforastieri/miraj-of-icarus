using Masicarus.Domain.Characters;

namespace Masicarus.Application.Characters;

public enum CharacterCreationStatus
{
    Created,
    SlotsFull,
    NameUnavailable,
}

public sealed record CharacterCreationResult(
    CharacterCreationStatus Status,
    Character? Character);

public interface ICharacterRepository
{
    Task<IReadOnlyList<Character>> ListAsync(
        long accountId,
        CancellationToken cancellationToken = default);

    Task<CharacterCreationResult> CreateAsync(
        Character character,
        int maximumCharacters,
        CancellationToken cancellationToken = default);

    Task<Character?> ScheduleDeletionAsync(
        long accountId,
        Guid characterId,
        DateTimeOffset deletionScheduledAt,
        CancellationToken cancellationToken = default);

    Task<Character?> RestoreAsync(
        long accountId,
        Guid characterId,
        CancellationToken cancellationToken = default);

    Task<int> DeleteExpiredAsync(
        DateTimeOffset now,
        CancellationToken cancellationToken = default);
}
