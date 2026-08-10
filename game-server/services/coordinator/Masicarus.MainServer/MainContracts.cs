using System.Security.Cryptography;
using System.Text;

namespace Masicarus.MainServer;

public sealed record AdmissionRequest(long AccountId, string UserName, string ServerId);

public sealed record AdmissionResponse(
    uint SessionId,
    string LobbyEndpoint,
    string LobbyTicket,
    DateTimeOffset ExpiresAt);

internal static class ServiceKeyValidator
{
    public static bool IsValid(HttpRequest request, string? expected)
    {
        if (string.IsNullOrEmpty(expected))
        {
            return false;
        }

        var actual = request.Headers["X-Masicarus-Service-Key"].ToString();
        var actualBytes = Encoding.UTF8.GetBytes(actual);
        var expectedBytes = Encoding.UTF8.GetBytes(expected);
        return actualBytes.Length == expectedBytes.Length &&
            CryptographicOperations.FixedTimeEquals(actualBytes, expectedBytes);
    }
}
