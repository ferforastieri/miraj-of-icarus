using MirajOfIcarus.Api.Authentication;
using MirajOfIcarus.Api.Characters;
using MirajOfIcarus.Application.Accounts;
using MirajOfIcarus.Application.Administration;
using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Application.GameServers;
using MirajOfIcarus.Application.Releases;
using MirajOfIcarus.Infrastructure;
using MirajOfIcarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpClient("client-releases", client =>
    client.Timeout = TimeSpan.FromSeconds(10));
builder.Services.AddHttpClient("turnstile", client =>
{
    client.BaseAddress = new Uri("https://challenges.cloudflare.com/turnstile/v0/");
    client.Timeout = TimeSpan.FromSeconds(5);
});
builder.Services.AddScoped<MirajOfIcarus.Api.Security.TurnstileVerifier>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<AdministrationService>();
builder.Services.AddScoped<MirajOfIcarus.Application.Authentication.AuthenticationService>();
builder.Services.AddScoped<CharacterService>();
builder.Services.AddScoped<CharacterDeletionService>();
builder.Services.AddScoped<GameServerService>();
builder.Services.AddScoped<ClientReleaseService>();
builder.Services.AddScoped<ClientDownloadService>();
builder.Services
    .AddAuthentication(OpaqueBearerDefaults.Scheme)
    .AddScheme<AuthenticationSchemeOptions, OpaqueBearerHandler>(
        OpaqueBearerDefaults.Scheme, _ => { });
builder.Services.AddAuthorization();
builder.Services.AddHostedService<CharacterDeletionWorker>();
var healthChecks = builder.Services.AddHealthChecks();
builder.Services.AddInfrastructure(builder.Configuration, healthChecks);

var app = builder.Build();

if (app.Configuration.GetValue<bool>("Database:ApplyMigrations"))
{
    await app.Services.ApplyDatabaseMigrationsAsync();
}

if (args is ["admin", "promote", var userName])
{
    await using var scope = app.Services.CreateAsyncScope();
    var result = await scope.ServiceProvider.GetRequiredService<AdministrationService>()
        .PromoteAsync(userName);
    if (!result.Succeeded)
    {
        Console.Error.WriteLine(result.Error!.Code);
        Environment.ExitCode = 1;
    }
    else
    {
        Console.WriteLine($"administrator={result.Value!.UserName}");
    }
    return;
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.Use(async (context, next) =>
{
    if (context.Request.ContentLength > 32 * 1024)
    {
        context.Response.StatusCode = StatusCodes.Status413PayloadTooLarge;
        return;
    }
    if (HttpMethods.IsPost(context.Request.Method) || HttpMethods.IsPut(context.Request.Method) ||
        HttpMethods.IsPatch(context.Request.Method) || HttpMethods.IsDelete(context.Request.Method))
    {
        var origin = context.Request.Headers.Origin.ToString();
        if (!string.IsNullOrEmpty(origin) &&
            !string.Equals(origin, "https://mirajoficarus.com", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(origin, "https://www.mirajoficarus.com", StringComparison.OrdinalIgnoreCase))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }
    }
    await next();
});
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHealthChecks("/health/live", new()
{
    Predicate = _ => false,
});
app.MapHealthChecks("/health/ready", new()
{
    Predicate = registration => registration.Tags.Contains("ready"),
});

app.Run();

public partial class Program;
