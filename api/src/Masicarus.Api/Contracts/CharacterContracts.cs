namespace Masicarus.Api.Contracts;

public sealed record CreateCharacterRequest(string Name, string Archetype, string Gender);

public sealed record CharacterResponse(
    Guid Id,
    string Name,
    string Archetype,
    string Gender,
    int Level,
    DateTimeOffset CreatedAt,
    DateTimeOffset? DeletionScheduledAt);
