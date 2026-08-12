namespace Masicarus.Game.Contracts;

public static class CharacterRules
{
    public const int MaximumCharactersPerAccount = 4;
    public static readonly TimeSpan DeletionGracePeriod = TimeSpan.FromDays(7);
    public static readonly IReadOnlySet<string> Archetypes =
        new HashSet<string>(["warrior", "priest", "wizard", "nature", "thief", "guardian"]);
    public static readonly IReadOnlySet<string> Genders = new HashSet<string>(["male", "female"]);

    public static string? Validate(string name, string archetype, string gender)
    {
        var trimmedName = name.Trim();
        if (trimmedName.Length is < 3 or > 24 ||
            trimmedName.Any(character => !char.IsLetterOrDigit(character)))
        {
            return "invalid_character_name";
        }

        if (!Archetypes.Contains(archetype)) return "invalid_archetype";
        return Genders.Contains(gender) ? null : "invalid_gender";
    }
}
