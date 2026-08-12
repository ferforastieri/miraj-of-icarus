namespace Masicarus.Domain.Accounts;

public sealed class Account
{
    public long Id { get; private set; }

    public string UserName { get; private set; } = string.Empty;

    public string NormalizedUserName { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public string PasswordSalt { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }

    private Account()
    {
    }

    public Account(
        string userName,
        string normalizedUserName,
        string passwordHash,
        string passwordSalt,
        DateTimeOffset createdAt)
    {
        UserName = userName;
        NormalizedUserName = normalizedUserName;
        PasswordHash = passwordHash;
        PasswordSalt = passwordSalt;
        CreatedAt = createdAt;
    }
}
