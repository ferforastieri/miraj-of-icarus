using MirajOfIcarus.Game.Runtime;
using MirajOfIcarus.Game.Contracts;
using MirajOfIcarus.LobbyServer;
using Npgsql;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

var databaseConnection = builder.Configuration.GetConnectionString("Database")
    ?? throw new InvalidOperationException("ConnectionStrings:Database is required.");
var redisConnection = builder.Configuration["Cache:ConnectionString"]
    ?? throw new InvalidOperationException("Cache:ConnectionString is required.");
builder.Services.AddSingleton(NpgsqlDataSource.Create(databaseConnection));
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var options = ConfigurationOptions.Parse(redisConnection);
    options.AbortOnConnectFail = false;
    return ConnectionMultiplexer.Connect(options);
});
builder.Services.AddSingleton<OpaqueTokenStore>();
builder.Services.AddSingleton<CharacterReadRepository>();
builder.Services.AddSingleton(TimeProvider.System);

var app = builder.Build();

app.MapGet("/health/live", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/health/ready", async (
    IConnectionMultiplexer redis,
    NpgsqlDataSource database,
    CancellationToken cancellationToken) =>
{
    var redisLatency = await redis.GetDatabase().PingAsync();
    await using var command = database.CreateCommand("SELECT 1;");
    await command.ExecuteScalarAsync(cancellationToken);
    return Results.Ok(new
    {
        status = "ready",
        redisMilliseconds = redisLatency.TotalMilliseconds,
    });
});

app.MapPost("/v1/sessions", async (
    OpenLobbySessionRequest request,
    OpaqueTokenStore tokens,
    TimeProvider timeProvider,
    CancellationToken cancellationToken) =>
{
    var ticket = await tokens.ConsumeAsync<LobbyTicket>(
        "lobby",
        request.Ticket,
        cancellationToken);
    if (ticket is null || ticket.ExpiresAt <= timeProvider.GetUtcNow())
    {
        return Results.Unauthorized();
    }

    var expiresAt = timeProvider.GetUtcNow().AddMinutes(15);
    var sessionToken = await tokens.IssueAsync(
        "lobby-session",
        new LobbySession(
            ticket.AccountId,
            ticket.UserName,
            ticket.SessionId,
            expiresAt),
        TimeSpan.FromMinutes(15),
        cancellationToken);
    return Results.Ok(new OpenLobbySessionResponse(sessionToken, expiresAt));
});

app.MapGet("/v1/characters", async (
    HttpRequest request,
    OpaqueTokenStore tokens,
    CharacterReadRepository characters,
    TimeProvider timeProvider,
    CancellationToken cancellationToken) =>
{
    var session = await LobbyAuthentication.AuthenticateAsync(
        request,
        tokens,
        timeProvider,
        cancellationToken);
    return session is null
        ? Results.Unauthorized()
        : Results.Ok(await characters.ListAsync(session.AccountId, cancellationToken));
});

app.Run();

internal static class LobbyAuthentication
{
    public static async ValueTask<LobbySession?> AuthenticateAsync(
        HttpRequest request,
        OpaqueTokenStore tokens,
        TimeProvider timeProvider,
        CancellationToken cancellationToken)
    {
        var authorization = request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";
        if (!authorization.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return null;
        }

        var session = await tokens.ReadAsync<LobbySession>(
            "lobby-session",
            authorization[prefix.Length..].Trim(),
            cancellationToken);
        return session is not null && session.ExpiresAt > timeProvider.GetUtcNow()
            ? session
            : null;
    }
}

public partial class Program;
