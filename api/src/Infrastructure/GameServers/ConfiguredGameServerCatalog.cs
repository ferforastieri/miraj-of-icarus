using MirajOfIcarus.Application.GameServers;
using Microsoft.Extensions.Configuration;

namespace MirajOfIcarus.Infrastructure.GameServers;

public sealed class ConfiguredGameServerCatalog(IConfiguration configuration)
    : IGameServerCatalog
{
    public IReadOnlyList<GameServer> GetAll()
    {
        var servers = configuration.GetSection("GameServers")
            .GetChildren()
            .Select(section => new GameServer(
                Required(section, "Id"),
                Required(section, "Name"),
                Required(section, "Region"),
                Required(section, "LoginEndpoint"),
                bool.TryParse(section["Available"], out var available) && available))
            .ToArray();
        return servers.Length > 0
            ? servers
            : throw new InvalidOperationException(
                "GameServers must contain at least one server.");
    }

    private static string Required(IConfigurationSection section, string key) =>
        section[key] ?? throw new InvalidOperationException(
            $"GameServers:{section.Key}:{key} is required.");
}
