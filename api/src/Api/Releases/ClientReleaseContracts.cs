namespace Masicarus.Api.Contracts;

public sealed record ClientReleaseResponse(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string LauncherUrl,
    DateTimeOffset PublishedAt);

public sealed record ClientReleaseMetadata(string Version, long TotalSize);

public sealed record ClientReleaseChannel(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string LauncherUrl,
    DateTimeOffset PublishedAt);
