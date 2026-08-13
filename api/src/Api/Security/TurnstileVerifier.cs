using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace MirajOfIcarus.Api.Security;

public sealed class TurnstileVerifier(
    IHttpClientFactory clients,
    IConfiguration configuration,
    IWebHostEnvironment environment)
{
    public async Task<bool> VerifyAsync(string? token, string? remoteIp,
        CancellationToken cancellationToken)
    {
        var secret = configuration["Turnstile:SecretKey"];
        if (string.IsNullOrWhiteSpace(secret)) return !environment.IsProduction();
        if (string.IsNullOrWhiteSpace(token)) return false;
        using var response = await clients.CreateClient("turnstile").PostAsync(
            "siteverify",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = secret,
                ["response"] = token,
                ["remoteip"] = remoteIp ?? string.Empty,
            }), cancellationToken);
        if (!response.IsSuccessStatusCode) return false;
        var result = await response.Content.ReadFromJsonAsync<TurnstileResponse>(cancellationToken);
        return result?.Success == true;
    }

    private sealed record TurnstileResponse([property: JsonPropertyName("success")] bool Success);
}
