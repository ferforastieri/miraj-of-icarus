using System.Text.Json;
using Masicarus.Game.Runtime;
using Masicarus.Game.Contracts;
using Masicarus.LobbyServer;
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
builder.Services.AddSingleton<CharacterRepository>();
builder.Services.AddSingleton(TimeProvider.System);

var app = builder.Build();

if (app.Configuration.GetValue("Database:ApplyMigrations", true))
{
    await LobbyDatabase.MigrateAsync(app.Services.GetRequiredService<NpgsqlDataSource>());
}

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
    CharacterRepository characters,
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

app.MapPost("/v1/characters", async (
    HttpRequest httpRequest,
    CreateCharacterRequest request,
    OpaqueTokenStore tokens,
    CharacterRepository characters,
    TimeProvider timeProvider,
    CancellationToken cancellationToken) =>
{
    var session = await LobbyAuthentication.AuthenticateAsync(
        httpRequest,
        tokens,
        timeProvider,
        cancellationToken);
    if (session is null)
    {
        return Results.Unauthorized();
    }

    var validationError = CharacterValidator.Validate(request);
    if (validationError is not null)
    {
        return Results.BadRequest(new { error = validationError });
    }

    var result = await characters.CreateAsync(
        session.AccountId,
        request with { Name = request.Name.Trim() },
        timeProvider.GetUtcNow(),
        cancellationToken);
    return result.Status switch
    {
        CreateCharacterStatus.Created => Results.Created(
            $"/v1/characters/{result.Character!.Id}",
            result.Character),
        CreateCharacterStatus.NameUnavailable => Results.Conflict(
            new { error = "character_name_unavailable" }),
        CreateCharacterStatus.SlotsFull => Results.Conflict(
            new { error = "character_slots_full" }),
        _ => Results.Problem(),
    };
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

internal static class CharacterValidator
{
    public static string? Validate(CreateCharacterRequest request)
    {
        var rulesError = CharacterRules.Validate(request.Name, request.Archetype, request.Gender);
        if (rulesError is not null) return rulesError;

        try
        {
            using var document = JsonDocument.Parse(request.Customization);
            if (document.RootElement.ValueKind != JsonValueKind.Object ||
                request.Customization.Length > 4096)
            {
                return "invalid_customization";
            }
        }
        catch (JsonException)
        {
            return "invalid_customization";
        }

        return null;
    }
}

public partial class Program;
