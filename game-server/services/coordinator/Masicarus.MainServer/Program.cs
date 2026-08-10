using Masicarus.Game.Contracts;
using Masicarus.Game.Runtime;
using Masicarus.MainServer;
using Masicarus.MainServer.Coordinator;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

var redisConnection = builder.Configuration["Cache:ConnectionString"]
    ?? throw new InvalidOperationException("Cache:ConnectionString is required.");
builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var options = ConfigurationOptions.Parse(redisConnection);
    options.AbortOnConnectFail = false;
    return ConnectionMultiplexer.Connect(options);
});
builder.Services.AddSingleton<OpaqueTokenStore>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IPlayerSessionRepository, RedisPlayerSessionRepository>();
builder.Services.AddSingleton<IWorldDirectory, LobbyWorldDirectory>();
builder.Services.AddSingleton<ITransitionValueIssuer, SecureTransitionValueIssuer>();
builder.Services.AddSingleton<ICoordinatorClock, SystemCoordinatorClock>();
builder.Services.AddSingleton<CoordinatorOrchestrator>();

var app = builder.Build();

app.MapGet("/health/live", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/health/ready", async (IConnectionMultiplexer redis) =>
{
    var latency = await redis.GetDatabase().PingAsync();
    return Results.Ok(new { status = "ready", redisMilliseconds = latency.TotalMilliseconds });
});

app.MapPost("/internal/v1/admissions", async (
    HttpRequest httpRequest,
    AdmissionRequest request,
    CoordinatorOrchestrator coordinator,
    OpaqueTokenStore tokens,
    IConfiguration configuration,
    TimeProvider timeProvider,
    CancellationToken cancellationToken) =>
{
    if (!ServiceKeyValidator.IsValid(httpRequest, configuration["Internal:ServiceKey"]))
    {
        return Results.Unauthorized();
    }

    if (request.AccountId is <= 0 or > uint.MaxValue ||
        request.ServerId != configuration["Server:Id"])
    {
        return Results.BadRequest(new { error = "invalid_admission" });
    }

    var userId = checked((uint)request.AccountId);
    var sessionId = SecureTransitionValueIssuer.RandomNonZeroUInt32();
    var registerCommand = new RegisterSessionCommand(
        request.UserName,
        userId,
        sessionId,
        new ConnectionCorrelation(
            SecureTransitionValueIssuer.RandomNonZeroUInt32(),
            SecureTransitionValueIssuer.RandomNonZeroUInt32()));
    var registration = await coordinator.RegisterAsync(registerCommand, cancellationToken);
    if (registration.Status == RegisterSessionStatus.DuplicateSession)
    {
        await coordinator.KickAsync(
            new KickSessionCommand(userId, registration.ExistingSession!.SessionId),
            cancellationToken);
        registration = await coordinator.RegisterAsync(registerCommand, cancellationToken);
    }

    if (registration.Status != RegisterSessionStatus.Registered)
    {
        return Results.Conflict(new { error = "duplicate_session" });
    }

    var selection = await coordinator.SelectWorldAsync(
        new SelectWorldCommand(userId, sessionId, 1),
        cancellationToken);
    if (selection.Status != SelectWorldStatus.Selected)
    {
        return Results.Problem(statusCode: 503, title: "Lobby is unavailable.");
    }

    var expiresAt = timeProvider.GetUtcNow().AddSeconds(60);
    var lobbyTicket = await tokens.IssueAsync(
        "lobby",
        new LobbyTicket(request.AccountId, request.UserName, sessionId, expiresAt),
        TimeSpan.FromSeconds(60),
        cancellationToken);
    return Results.Ok(new AdmissionResponse(
        sessionId,
        configuration["Lobby:Endpoint"]!,
        lobbyTicket,
        expiresAt));
});

app.Run();

public partial class Program;
