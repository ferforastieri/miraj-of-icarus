using MirajOfIcarus.Application.Authentication;

namespace MirajOfIcarus.Application.Releases;

public sealed record ClientDownloadSession(
    string Version,
    long TotalSize,
    string ManifestUrl,
    string SignatureUrl,
    string FilesBaseUrl,
    string AccessToken,
    DateTimeOffset ExpiresAt);

public interface IDownloadTokenIssuer
{
    (string Token, DateTimeOffset ExpiresAt) Issue(AccountIdentity account, string version);
}

public sealed class ClientDownloadService(
    ClientReleaseService releases,
    IDownloadTokenIssuer tokens)
{
    public async Task<Common.ApplicationResult<ClientDownloadSession>> CreateAsync(
        AccountIdentity account,
        CancellationToken cancellationToken = default)
    {
        var release = await releases.GetLatestAsync(cancellationToken);
        if (!release.Succeeded)
            return Common.ApplicationResult.Failure<ClientDownloadSession>(
                release.Error!.Code, release.Error.Type);
        var authorization = tokens.Issue(account, release.Value!.Version);
        return Common.ApplicationResult.Success(new ClientDownloadSession(
            release.Value.Version,
            release.Value.TotalSize,
            release.Value.ManifestUrl,
            release.Value.SignatureUrl,
            release.Value.FilesBaseUrl,
            authorization.Token,
            authorization.ExpiresAt));
    }
}
