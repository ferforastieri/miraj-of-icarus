using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MirajOfIcarus.Api.Security;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public sealed class RateLimitAttribute : TypeFilterAttribute
{
    public RateLimitAttribute(string policy) : base(typeof(RateLimitFilter))
    {
        Arguments = [policy];
    }
}

public sealed class RateLimitFilter(
    string policy,
    IRateLimitStore limits) : IAsyncActionFilter
{
    private static readonly Dictionary<string, (int Limit, TimeSpan Window)> Policies =
        new Dictionary<string, (int, TimeSpan)>(StringComparer.Ordinal)
        {
            ["register"] = (3, TimeSpan.FromHours(1)),
            ["login"] = (10, TimeSpan.FromMinutes(1)),
            ["session"] = (30, TimeSpan.FromMinutes(1)),
            ["public-read"] = (120, TimeSpan.FromMinutes(1)),
            ["account-read"] = (120, TimeSpan.FromMinutes(1)),
            ["account-write"] = (20, TimeSpan.FromMinutes(1)),
            ["game-ticket"] = (10, TimeSpan.FromMinutes(1)),
            ["download"] = (12, TimeSpan.FromHours(1)),
            ["admin-read"] = (120, TimeSpan.FromMinutes(1)),
            ["admin-write"] = (20, TimeSpan.FromMinutes(1)),
        };

    public async Task OnActionExecutionAsync(
        ActionExecutingContext context,
        ActionExecutionDelegate next)
    {
        var configuration = Policies[policy];
        foreach (var partition in Partitions(context))
        {
            var result = await limits.AcquireAsync(
                policy, partition, configuration.Limit, configuration.Window,
                context.HttpContext.RequestAborted);
            context.HttpContext.Response.Headers["RateLimit-Limit"] = result.Limit.ToString(CultureInfo.InvariantCulture);
            context.HttpContext.Response.Headers["RateLimit-Remaining"] = result.Remaining.ToString(CultureInfo.InvariantCulture);
            if (!result.Allowed)
            {
                context.HttpContext.Response.Headers.RetryAfter =
                    Math.Ceiling(result.RetryAfter.TotalSeconds).ToString(CultureInfo.InvariantCulture);
                context.Result = new ObjectResult(new ErrorResponse("rate_limited"))
                {
                    StatusCode = StatusCodes.Status429TooManyRequests,
                };
                return;
            }
        }
        await next();
    }

    private IEnumerable<string> Partitions(ActionExecutingContext context)
    {
        var accountId = context.HttpContext.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrWhiteSpace(accountId))
        {
            yield return $"account:{accountId}";
        }
        else
        {
            yield return $"ip:{ClientAddress(context.HttpContext)}";
        }

        if (policy == "login" && context.ActionArguments.Values.OfType<LoginRequest>().FirstOrDefault() is { } login)
        {
            yield return $"username:{Digest(login.UserName.Trim().ToUpperInvariant())}";
        }
    }

    private static string Digest(string value) =>
        Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(value)))[..24];

    private static string ClientAddress(HttpContext context)
    {
        // The origin is private behind Cloudflare/Caddy; Cloudflare overwrites this header.
        var cloudflare = context.Request.Headers["CF-Connecting-IP"].ToString();
        return string.IsNullOrWhiteSpace(cloudflare)
            ? context.Connection.RemoteIpAddress?.ToString() ?? "unknown"
            : cloudflare;
    }
}
