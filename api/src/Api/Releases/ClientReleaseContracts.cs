namespace MirajOfIcarus.Api.Contracts;

public sealed record ClientReleaseResponse(
    string Version,
    long TotalSize,
    string LauncherUrl,
    DateTimeOffset PublishedAt);

public sealed record ClientDownloadSessionResponse(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string AccessToken,
    DateTimeOffset ExpiresAt);

public sealed record ClientReleaseMetadata(string Version, long TotalSize);

public sealed record ClientReleaseChannel(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string LauncherUrl,
    DateTimeOffset PublishedAt);
