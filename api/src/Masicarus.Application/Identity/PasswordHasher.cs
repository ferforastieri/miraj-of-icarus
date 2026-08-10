using System.Security.Cryptography;

namespace Masicarus.Application.Identity;

public static class PasswordHasher
{
    public const int Iterations = 310_000;
    private const int SaltLength = 16;
    private const int HashLength = 32;

    public static PasswordHashResult Hash(string password)
    {
        ValidatePassword(password);
        var salt = RandomNumberGenerator.GetBytes(SaltLength);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            HashLength);
        return new PasswordHashResult(
            Convert.ToBase64String(hash),
            Convert.ToBase64String(salt));
    }

    public static bool Verify(string password, string encodedHash, string encodedSalt)
    {
        if (string.IsNullOrEmpty(password))
        {
            return false;
        }

        byte[] expected;
        byte[] salt;
        try
        {
            expected = Convert.FromBase64String(encodedHash);
            salt = Convert.FromBase64String(encodedSalt);
        }
        catch (FormatException)
        {
            return false;
        }

        var actual = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            Iterations,
            HashAlgorithmName.SHA256,
            expected.Length);
        return CryptographicOperations.FixedTimeEquals(actual, expected);
    }

    private static void ValidatePassword(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        if (password.Length is < 10 or > 200)
        {
            throw new ArgumentOutOfRangeException(
                nameof(password),
                "Passwords must contain between 10 and 200 characters.");
        }
    }
}

public sealed record PasswordHashResult(string Hash, string Salt);
