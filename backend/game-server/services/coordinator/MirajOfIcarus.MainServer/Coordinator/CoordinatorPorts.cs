using MirajOfIcarus.Game.Contracts;

namespace MirajOfIcarus.MainServer.Coordinator;

public interface IPlayerSessionRepository
{
    ValueTask<PlayerSession?> FindByUserIdAsync(
        uint userId,
        CancellationToken cancellationToken = default);

    ValueTask<PlayerSession?> TryRegisterAsync(
        PlayerSession candidate,
        CancellationToken cancellationToken = default);

    ValueTask<bool> TryRemoveAsync(
        uint userId,
        uint sessionId,
        CancellationToken cancellationToken = default);
}

public interface IWorldDirectory
{
    ValueTask<WorldDestination?> FindAsync(
        uint worldId,
        CancellationToken cancellationToken = default);
}

public interface ITransitionValueIssuer
{
    ValueTask<uint> IssueAsync(
        PlayerSession session,
        WorldDestination destination,
        CancellationToken cancellationToken = default);
}

public interface ICoordinatorClock
{
    DateTimeOffset UtcNow { get; }
}
