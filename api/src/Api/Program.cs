using MirajOfIcarus.Api.Authentication;
using MirajOfIcarus.Api.Characters;
using MirajOfIcarus.Application.Accounts;
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
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<MirajOfIcarus.Application.Authentication.AuthenticationService>();
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
