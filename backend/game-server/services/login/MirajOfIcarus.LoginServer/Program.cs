using MirajOfIcarus.Game.Contracts;
using MirajOfIcarus.Game.Runtime;
using MirajOfIcarus.LoginServer;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

var redisConnection = builder.Configuration["Cache:ConnectionString"]
    ?? throw new InvalidOperationException("Cache:ConnectionString is required.");
var mainEndpoint = builder.Configuration["Main:Endpoint"]
    ?? throw new InvalidOperationException("Main:Endpoint is required.");
var serviceKey = builder.Configuration["Main:ServiceKey"]
    ?? throw new InvalidOperationException("Main:ServiceKey is required.");

builder.Services.AddSingleton<IConnectionMultiplexer>(_ =>
{
    var options = ConfigurationOptions.Parse(redisConnection);
    options.AbortOnConnectFail = false;
    return ConnectionMultiplexer.Connect(options);
});
builder.Services.AddSingleton<OpaqueTokenStore>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddHttpClient("main", client =>
{
    client.BaseAddress = new Uri(mainEndpoint, UriKind.Absolute);
    client.DefaultRequestHeaders.Add("X-MirajOfIcarus-Service-Key", serviceKey);
    client.Timeout = TimeSpan.FromSeconds(5);
});
var app = builder.Build();

app.MapGet("/health/live", () => Results.Ok(new { status = "healthy" }));
app.MapGet("/health/ready", async (IConnectionMultiplexer redis) =>
{
    var latency = await redis.GetDatabase().PingAsync();
    return Results.Ok(new { status = "ready", redisMilliseconds = latency.TotalMilliseconds });
});

app.MapPost("/v1/sessions", async (
    OpenLoginSessionRequest request,
    OpaqueTokenStore tokens,
    IHttpClientFactory clients,
    TimeProvider timeProvider,
    CancellationToken cancellationToken) =>
{
    var ticket = await tokens.ConsumeAsync<LoginTicket>(
        "login",
        request.Ticket,
        cancellationToken);
    if (ticket is null || ticket.ExpiresAt <= timeProvider.GetUtcNow())
    {
        return Results.Unauthorized();
    }

    using var response = await clients.CreateClient("main").PostAsJsonAsync(
        "/internal/v1/admissions",
        new AdmissionRequest(ticket.AccountId, ticket.UserName, ticket.ServerId),
        cancellationToken);
    if (!response.IsSuccessStatusCode)
    {
        return Results.Problem(
            statusCode: (int)response.StatusCode,
            title: "Coordinator rejected the session.");
    }

    var admission = await response.Content.ReadFromJsonAsync<AdmissionResponse>(
        cancellationToken);
    return admission is null
        ? Results.Problem(statusCode: 502, title: "Coordinator returned an invalid response.")
        : Results.Ok(admission);
});

app.Run();

public partial class Program;
