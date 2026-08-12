using Masicarus.Api.Contracts;
using Masicarus.Domain.Characters;

namespace Masicarus.Api.Characters;

internal static class CharacterMapping
{
    public static CharacterResponse ToResponse(this Character character) => new(
        character.Id,
        character.Name,
        character.Archetype,
        character.Gender,
        character.Level,
        character.CreatedAt,
        character.DeletionScheduledAt);
}
