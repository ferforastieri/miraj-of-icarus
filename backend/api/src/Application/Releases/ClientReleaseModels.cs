namespace MirajOfIcarus.Application.Releases;

public sealed record ClientRelease(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string LauncherUrl,
    DateTimeOffset PublishedAt);

public enum ClientReleaseProviderStatus
{
    Available,
    NotFound,
    Unavailable,
}

public sealed record ClientReleaseProviderResult(
    ClientReleaseProviderStatus Status,
    ClientRelease? Release = null);

public interface IClientReleaseProvider
{
    Task<ClientReleaseProviderResult> GetLatestAsync(
        CancellationToken cancellationToken = default);
}
