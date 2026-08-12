using MirajOfIcarus.Application.Common;
using MirajOfIcarus.Domain.Characters;
using MirajOfIcarus.Game.Contracts;

namespace MirajOfIcarus.Application.Characters;

public sealed class CharacterService(
    ICharacterRepository characters,
    TimeProvider timeProvider)
{
    public Task<IReadOnlyList<Character>> ListAsync(
        long accountId,
        CancellationToken cancellationToken = default) =>
        characters.ListAsync(accountId, cancellationToken);

    public async Task<ApplicationResult<Character>> CreateAsync(
        long accountId,
        string? requestedName,
        string? archetype,
        string? gender,
        CancellationToken cancellationToken = default)
    {
        var name = requestedName?.Trim() ?? string.Empty;
        var validationError = CharacterRules.Validate(
            name, archetype ?? string.Empty, gender ?? string.Empty);
        if (validationError is not null)
        {
            return ApplicationResult.Failure<Character>(
                validationError, ApplicationErrorType.Validation);
        }

        var character = new Character(
            accountId, name, archetype!, gender!, timeProvider.GetUtcNow());
        var creation = await characters.CreateAsync(
            character,
            CharacterRules.MaximumCharactersPerAccount,
            cancellationToken);
        return creation.Status switch
        {
            CharacterCreationStatus.Created => ApplicationResult.Success(character),
            CharacterCreationStatus.SlotsFull => ApplicationResult.Failure<Character>(
                "character_slots_full", ApplicationErrorType.Conflict),
            _ => ApplicationResult.Failure<Character>(
                "character_name_unavailable", ApplicationErrorType.Conflict),
        };
    }

    public async Task<ApplicationResult<Character>> ScheduleDeletionAsync(
        long accountId,
        Guid characterId,
        CancellationToken cancellationToken = default)
    {
        var character = await characters.ScheduleDeletionAsync(
            accountId,
            characterId,
            timeProvider.GetUtcNow().Add(CharacterRules.DeletionGracePeriod),
            cancellationToken);
        return character is null
            ? ApplicationResult.Failure<Character>(
                "character_not_found", ApplicationErrorType.NotFound)
            : ApplicationResult.Success(character);
    }

    public async Task<ApplicationResult<Character>> RestoreAsync(
        long accountId,
        Guid characterId,
        CancellationToken cancellationToken = default)
    {
        var character = await characters.RestoreAsync(
            accountId, characterId, cancellationToken);
        return character is null
            ? ApplicationResult.Failure<Character>(
                "character_not_found", ApplicationErrorType.NotFound)
            : ApplicationResult.Success(character);
    }
}

public sealed class CharacterDeletionService(
    ICharacterRepository characters,
    TimeProvider timeProvider)
{
    public Task<int> DeleteExpiredAsync(CancellationToken cancellationToken = default) =>
        characters.DeleteExpiredAsync(timeProvider.GetUtcNow(), cancellationToken);
}
