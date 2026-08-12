using Masicarus.Api.Authentication;
using Masicarus.Api.Characters;
using Masicarus.Application.Accounts;
using Masicarus.Application.Characters;
using Masicarus.Application.GameServers;
using Masicarus.Application.Releases;
using Masicarus.Infrastructure;
using Masicarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddHttpClient("client-releases", client =>
    client.Timeout = TimeSpan.FromSeconds(10));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<Masicarus.Application.Authentication.AuthenticationService>();
builder.Services.AddScoped<CharacterService>();
builder.Services.AddScoped<CharacterDeletionService>();
builder.Services.AddScoped<GameServerService>();
builder.Services.AddScoped<ClientReleaseService>();
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

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

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
