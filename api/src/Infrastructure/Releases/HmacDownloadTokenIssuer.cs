using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MirajOfIcarus.Application.Authentication;
using MirajOfIcarus.Application.Releases;
using Microsoft.Extensions.Configuration;

namespace MirajOfIcarus.Infrastructure.Releases;

public sealed class HmacDownloadTokenIssuer : IDownloadTokenIssuer
{
    private static readonly byte[] Header = Encoding.UTF8.GetBytes("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
    private readonly byte[] key;
    private readonly TimeProvider timeProvider;

    public HmacDownloadTokenIssuer(IConfiguration configuration, TimeProvider timeProvider)
    {
        var encoded = configuration["DownloadAuthorization:SigningKey"]
            ?? throw new InvalidOperationException("DownloadAuthorization:SigningKey não foi configurada.");
        key = Convert.FromBase64String(encoded);
        if (key.Length < 32) throw new InvalidOperationException("A chave de download deve ter pelo menos 256 bits.");
        this.timeProvider = timeProvider;
    }

    public (string Token, DateTimeOffset ExpiresAt) Issue(AccountIdentity account, string version)
    {
        var expiresAt = timeProvider.GetUtcNow().AddMinutes(15);
        var payload = JsonSerializer.SerializeToUtf8Bytes(new
        {
            sub = account.AccountId.ToString(System.Globalization.CultureInfo.InvariantCulture),
            ver = version,
            aud = "miraj-downloads",
            exp = expiresAt.ToUnixTimeSeconds(),
        });
        var unsigned = $"{Base64Url(Header)}.{Base64Url(payload)}";
        var signature = HMACSHA256.HashData(key, Encoding.ASCII.GetBytes(unsigned));
        return ($"{unsigned}.{Base64Url(signature)}", expiresAt);
    }

    private static string Base64Url(byte[] value) => Convert.ToBase64String(value)
        .TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
