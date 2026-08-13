namespace MirajOfIcarus.Api.Contracts;

public sealed record ServiceStatusResponse(
    string Service,
    string Status,
    string Version);
