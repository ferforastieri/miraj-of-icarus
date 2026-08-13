namespace MirajOfIcarus.Domain.Administration;

public sealed class AdministrationAudit
{
    public long Id { get; private set; }
    public long AdministratorAccountId { get; private set; }
    public string Action { get; private set; } = string.Empty;
    public string Target { get; private set; } = string.Empty;
    public string Details { get; private set; } = "{}";
    public DateTimeOffset CreatedAt { get; private set; }

    private AdministrationAudit() { }

    public AdministrationAudit(long administratorAccountId, string action, string target,
        string details, DateTimeOffset createdAt)
    {
        AdministratorAccountId = administratorAccountId;
        Action = action;
        Target = target;
        Details = details;
        CreatedAt = createdAt;
    }
}

public sealed class GameServerOverride
{
    public string ServerId { get; private set; } = string.Empty;
    public bool Maintenance { get; private set; }
    public string? Message { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public long UpdatedByAccountId { get; private set; }

    private GameServerOverride() { }

    public GameServerOverride(string serverId, bool maintenance, string? message,
        DateTimeOffset updatedAt, long updatedByAccountId)
    {
        ServerId = serverId;
        Set(maintenance, message, updatedAt, updatedByAccountId);
    }

    public void Set(bool maintenance, string? message, DateTimeOffset updatedAt, long accountId)
    {
        Maintenance = maintenance;
        Message = string.IsNullOrWhiteSpace(message) ? null : message.Trim();
        UpdatedAt = updatedAt;
        UpdatedByAccountId = accountId;
    }
}
