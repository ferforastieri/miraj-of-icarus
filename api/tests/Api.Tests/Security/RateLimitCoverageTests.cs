using System.Reflection;
using MirajOfIcarus.Api.Security;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;

namespace MirajOfIcarus.Api.Tests.Security;

public sealed class RateLimitCoverageTests
{
    [Fact]
    public void EveryControllerActionHasARateLimitPolicy()
    {
        var uncovered = typeof(Program).Assembly.GetTypes()
            .Where(type => !type.IsAbstract && typeof(ControllerBase).IsAssignableFrom(type))
            .SelectMany(type => type
                .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
                .Where(method => method.GetCustomAttributes<HttpMethodAttribute>().Any())
                .Where(method => !method.IsDefined(typeof(RateLimitAttribute), inherit: true) &&
                    !type.IsDefined(typeof(RateLimitAttribute), inherit: true))
                .Select(method => $"{type.FullName}.{method.Name}"))
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToArray();

        Assert.True(
            uncovered.Length == 0,
            $"Controller actions without rate limiting:{Environment.NewLine}{string.Join(Environment.NewLine, uncovered)}");
    }
}
