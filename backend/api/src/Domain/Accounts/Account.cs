namespace MirajOfIcarus.Domain.Accounts;

public enum AccountRole
{
    Player,
    Administrator,
}

public enum AccountStatus
{
    Active,
    Suspended,
}

public sealed class Account
{
    public long Id { get; private set; }

    public string UserName { get; private set; } = string.Empty;

    public string NormalizedUserName { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public string PasswordSalt { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }

    public AccountRole Role { get; private set; } = AccountRole.Player;

    public AccountStatus Status { get; private set; } = AccountStatus.Active;

    public string? SuspensionReason { get; private set; }

    public DateTimeOffset? SuspendedAt { get; private set; }

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

    public void PromoteToAdministrator() => Role = AccountRole.Administrator;

    public void Suspend(string reason, DateTimeOffset when)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(reason);
        Status = AccountStatus.Suspended;
        SuspensionReason = reason.Trim();
        SuspendedAt = when;
    }

    public void Restore()
    {
        Status = AccountStatus.Active;
        SuspensionReason = null;
        SuspendedAt = null;
    }
}
