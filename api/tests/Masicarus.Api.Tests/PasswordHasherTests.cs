using Masicarus.Application.Identity;

namespace Masicarus.Api.Tests;

public sealed class PasswordHasherTests
{
    [Fact]
    public void RoundTripAcceptsTheOriginalPasswordOnly()
    {
        var result = PasswordHasher.Hash("correct horse battery staple");

        Assert.True(PasswordHasher.Verify(
            "correct horse battery staple",
            result.Hash,
            result.Salt));
        Assert.False(PasswordHasher.Verify("incorrect password", result.Hash, result.Salt));
    }

    [Fact]
    public void HashingTheSamePasswordUsesDifferentSalts()
    {
        var first = PasswordHasher.Hash("correct horse battery staple");
        var second = PasswordHasher.Hash("correct horse battery staple");

        Assert.NotEqual(first.Salt, second.Salt);
        Assert.NotEqual(first.Hash, second.Hash);
    }
}
