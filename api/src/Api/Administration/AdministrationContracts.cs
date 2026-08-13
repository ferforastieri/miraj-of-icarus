using MirajOfIcarus.Api.Contracts;

namespace MirajOfIcarus.Api.Administration;

public sealed record AdministrationOverviewResponse(
    long Accounts, long Characters, int AvailableServers, int TotalServers,
    ClientReleaseResponse? Release);

public sealed record AdministrationAccountResponse(
    long AccountId, string UserName, string Role, string Status,
    string? SuspensionReason, DateTimeOffset? SuspendedAt, DateTimeOffset CreatedAt);

public sealed record AdministrationAccountPageResponse(
    IReadOnlyList<AdministrationAccountResponse> Items, long Total, int Page, int PageSize);

public sealed record SuspendAccountRequest(string Reason);
public sealed record SetMaintenanceRequest(bool Enabled, string? Message);
public sealed record MaintenanceResponse(
    string ServerId, bool Enabled, string? Message, DateTimeOffset UpdatedAt);
public sealed record AdministrationAuditResponse(
    long Id, long AdministratorAccountId, string Action, string Target,
    string Details, DateTimeOffset CreatedAt);
