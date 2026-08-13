using MirajOfIcarus.Game.Contracts;

namespace MirajOfIcarus.Coordinator.Tests;

public sealed class CharacterRulesTests
{
    [Theory]
    [InlineData("warrior", "male")]
    [InlineData("priest", "female")]
    [InlineData("wizard", "male")]
    [InlineData("nature", "female")]
    [InlineData("thief", "male")]
    [InlineData("guardian", "female")]
    public void EveryPublishedArchetypeAndGenderIsAccepted(string archetype, string gender)
    {
        Assert.Null(CharacterRules.Validate("Viajante1", archetype, gender));
    }

    [Theory]
    [InlineData("ab", "warrior", "male", "invalid_character_name")]
    [InlineData("nome com espaço", "warrior", "male", "invalid_character_name")]
    [InlineData("Viajante", "paladin", "male", "invalid_archetype")]
    [InlineData("Viajante", "warrior", "unknown", "invalid_gender")]
    public void InvalidCharacterChoicesReturnStableErrors(
        string name,
        string archetype,
        string gender,
        string expected)
    {
        Assert.Equal(expected, CharacterRules.Validate(name, archetype, gender));
    }

    [Fact]
    public void SharedLifecycleRulesMatchThePortalContract()
    {
        Assert.Equal(4, CharacterRules.MaximumCharactersPerAccount);
        Assert.Equal(TimeSpan.FromDays(7), CharacterRules.DeletionGracePeriod);
    }
}
