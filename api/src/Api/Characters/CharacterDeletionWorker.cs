using Masicarus.Application.Characters;

namespace Masicarus.Api.Characters;

public sealed class CharacterDeletionWorker(
    IServiceScopeFactory scopeFactory,
    TimeProvider timeProvider,
    ILogger<CharacterDeletionWorker> logger) : BackgroundService
{
    private static readonly Action<ILogger, int, Exception?> LogDeletedCharacters =
        LoggerMessage.Define<int>(
            LogLevel.Information,
            new EventId(1, nameof(LogDeletedCharacters)),
            "Removed {Count} expired characters.");

    private static readonly Action<ILogger, Exception?> LogDeletionFailure =
        LoggerMessage.Define(
            LogLevel.Error,
            new EventId(2, nameof(LogDeletionFailure)),
            "Could not remove expired characters.");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var deletionService = scope.ServiceProvider
                    .GetRequiredService<CharacterDeletionService>();
                var deleted = await deletionService.DeleteExpiredAsync(stoppingToken);
                if (deleted > 0) LogDeletedCharacters(logger, deleted, null);
            }
            catch (Exception exception) when (exception is not OperationCanceledException)
            {
                LogDeletionFailure(logger, exception);
            }

            await Task.Delay(TimeSpan.FromHours(1), timeProvider, stoppingToken);
        }
    }
}
