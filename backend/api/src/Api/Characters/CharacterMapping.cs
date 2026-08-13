using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Domain.Characters;

namespace MirajOfIcarus.Api.Characters;

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
