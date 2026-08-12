namespace Masicarus.Domain.Game;

public sealed class Character
{
    public Guid Id { get; private set; }
    public long AccountId { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string NormalizedName { get; private set; } = string.Empty;
    public string Archetype { get; private set; } = string.Empty;
    public string Gender { get; private set; } = string.Empty;
    public string Customization { get; private set; } = "{}";
    public int Level { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset? DeletionScheduledAt { get; private set; }

    private Character() { }

    public Character(long accountId, string name, string archetype, string gender, DateTimeOffset createdAt)
    {
        Id = Guid.NewGuid();
        AccountId = accountId;
        Name = name;
        NormalizedName = name.ToUpperInvariant();
        Archetype = archetype;
        Gender = gender;
        Customization = "{}";
        Level = 1;
        CreatedAt = createdAt;
    }

    public void ScheduleDeletion(DateTimeOffset when) => DeletionScheduledAt = when;
    public void Restore() => DeletionScheduledAt = null;
}
