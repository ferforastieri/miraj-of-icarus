namespace Masicarus.Api.Contracts;

public sealed record ClientReleaseResponse(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl);

public sealed record ClientReleaseMetadata(string Version, long TotalSize);
