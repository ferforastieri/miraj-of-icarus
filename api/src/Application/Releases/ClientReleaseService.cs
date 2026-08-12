using MirajOfIcarus.Application.Common;

namespace MirajOfIcarus.Application.Releases;

public sealed class ClientReleaseService(IClientReleaseProvider provider)
{
    public async Task<ApplicationResult<ClientRelease>> GetLatestAsync(
        CancellationToken cancellationToken = default)
    {
        var result = await provider.GetLatestAsync(cancellationToken);
        if (result.Status == ClientReleaseProviderStatus.NotFound)
        {
            return ApplicationResult.Failure<ClientRelease>(
                "client_release_unavailable", ApplicationErrorType.NotFound);
        }
        if (result.Status != ClientReleaseProviderStatus.Available || result.Release is null)
        {
            return ApplicationResult.Failure<ClientRelease>(
                "client_release_service_unavailable", ApplicationErrorType.Unavailable);
        }

        var release = result.Release;
        if (!IsVersion(release.Version) || release.TotalSize <= 0 ||
            !IsPublicHttpsUrl(release.ManifestUrl) ||
            !IsPublicHttpsUrl(release.SignatureUrl) ||
            !IsPublicHttpsUrl(release.FilesBaseUrl) ||
            !IsPublicHttpsUrl(release.LauncherUrl))
        {
            return ApplicationResult.Failure<ClientRelease>(
                "invalid_client_release", ApplicationErrorType.Unavailable);
        }

        return ApplicationResult.Success(release);
    }

    private static bool IsVersion(string? value) =>
        value is { Length: 40 } && value.All(character =>
            character is >= '0' and <= '9' or >= 'a' and <= 'f');

    private static bool IsPublicHttpsUrl(string value) =>
        Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps &&
        !string.IsNullOrWhiteSpace(uri.Host);
}
