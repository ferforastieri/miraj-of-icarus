namespace MirajOfIcarus.Domain.Platform;

public sealed class PlatformMetadata
{
    private PlatformMetadata()
    {
    }

    public PlatformMetadata(string key, string value, DateTimeOffset updatedAt)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        ArgumentException.ThrowIfNullOrWhiteSpace(value);

        Key = key;
        Value = value;
        UpdatedAt = updatedAt;
    }

    public string Key { get; private set; } = string.Empty;

    public string Value { get; private set; } = string.Empty;

    public DateTimeOffset UpdatedAt { get; private set; }
}
