using MirajOfIcarus.Game.Contracts;
using MirajOfIcarus.MainServer.Coordinator;

namespace MirajOfIcarus.Coordinator.Tests;

public sealed class CoordinatorOrchestratorTests
{
    [Fact]
    public async Task RegisterReturnsTheExistingSessionWithoutReplacingIt()
    {
        var fixture = new Fixture();
        var first = await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));
        var duplicate = await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 200, new ConnectionCorrelation(2, 1)));

        Assert.Equal(RegisterSessionStatus.Registered, first.Status);
        Assert.Equal(RegisterSessionStatus.DuplicateSession, duplicate.Status);
        Assert.NotNull(duplicate.ExistingSession);
        Assert.Equal((uint)100, duplicate.ExistingSession.SessionId);
        Assert.Equal(new ConnectionCorrelation(1, 1), duplicate.ExistingSession.LoginConnection);
    }

    [Fact]
    public async Task KickCannotRemoveAReplacedOrDifferentSession()
    {
        var fixture = new Fixture();
        await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));

        var result = await fixture.Orchestrator.KickAsync(new KickSessionCommand(10, 999));

        Assert.Equal(KickSessionStatus.SessionMismatch, result.Status);
        Assert.NotNull(await fixture.Sessions.FindByUserIdAsync(10));
    }

    [Fact]
    public async Task KickRemovesOnlyTheMatchingSession()
    {
        var fixture = new Fixture();
        await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));

        var result = await fixture.Orchestrator.KickAsync(new KickSessionCommand(10, 100));

        Assert.Equal(KickSessionStatus.Removed, result.Status);
        Assert.Null(await fixture.Sessions.FindByUserIdAsync(10));
    }

    [Fact]
    public async Task SelectWorldRejectsStaleSessionBeforeIssuingTransition()
    {
        var fixture = new Fixture();
        await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));
        fixture.Worlds.Add(new WorldDestination(7, "World", "127.0.0.1", 6001, true));

        var result = await fixture.Orchestrator.SelectWorldAsync(
            new SelectWorldCommand(10, 999, 7));

        Assert.Equal(SelectWorldStatus.SessionMismatch, result.Status);
        Assert.Equal(0, fixture.TransitionValues.IssueCount);
    }

    [Fact]
    public async Task SelectWorldRejectsUnavailableDestination()
    {
        var fixture = new Fixture();
        await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));
        fixture.Worlds.Add(new WorldDestination(7, "World", "127.0.0.1", 6001, false));

        var result = await fixture.Orchestrator.SelectWorldAsync(
            new SelectWorldCommand(10, 100, 7));

        Assert.Equal(SelectWorldStatus.WorldUnavailable, result.Status);
        Assert.Equal(0, fixture.TransitionValues.IssueCount);
    }

    [Fact]
    public async Task SelectWorldReturnsDestinationAndNonZeroTransition()
    {
        var fixture = new Fixture();
        await fixture.Orchestrator.RegisterAsync(
            new RegisterSessionCommand("account", 10, 100, new ConnectionCorrelation(1, 1)));
        var world = new WorldDestination(7, "World", "127.0.0.1", 6001, true);
        fixture.Worlds.Add(world);

        var result = await fixture.Orchestrator.SelectWorldAsync(
            new SelectWorldCommand(10, 100, 7));

        Assert.Equal(SelectWorldStatus.Selected, result.Status);
        Assert.Equal(world, result.Destination);
        Assert.Equal((uint)0x12345678, result.TransitionValue);
        Assert.Equal(1, fixture.TransitionValues.IssueCount);
    }

    private sealed class Fixture
    {
        public Fixture()
        {
            Orchestrator = new CoordinatorOrchestrator(
                Sessions,
                Worlds,
                TransitionValues,
                new FixedClock(new DateTimeOffset(2026, 8, 2, 12, 0, 0, TimeSpan.Zero)));
        }

        public InMemorySessions Sessions { get; } = new();

        public InMemoryWorlds Worlds { get; } = new();

        public FixedTransitionValues TransitionValues { get; } = new();

        public CoordinatorOrchestrator Orchestrator { get; }
    }

    private sealed class InMemorySessions : IPlayerSessionRepository
    {
        private readonly Lock gate = new();
        private readonly Dictionary<uint, PlayerSession> byUserId = [];
        private readonly Dictionary<string, PlayerSession> byAccount = new(StringComparer.OrdinalIgnoreCase);

        public ValueTask<PlayerSession?> FindByUserIdAsync(
            uint userId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lock (gate)
            {
                return ValueTask.FromResult(byUserId.GetValueOrDefault(userId));
            }
        }

        public ValueTask<PlayerSession?> TryRegisterAsync(
            PlayerSession candidate,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lock (gate)
            {
                if (byUserId.TryGetValue(candidate.UserId, out var existingById))
                {
                    return ValueTask.FromResult<PlayerSession?>(existingById);
                }

                if (byAccount.TryGetValue(candidate.AccountName, out var existingByAccount))
                {
                    return ValueTask.FromResult<PlayerSession?>(existingByAccount);
                }

                byUserId.Add(candidate.UserId, candidate);
                byAccount.Add(candidate.AccountName, candidate);
                return ValueTask.FromResult<PlayerSession?>(null);
            }
        }

        public ValueTask<bool> TryRemoveAsync(
            uint userId,
            uint sessionId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            lock (gate)
            {
                if (!byUserId.TryGetValue(userId, out var existing) ||
                    existing.SessionId != sessionId)
                {
                    return ValueTask.FromResult(false);
                }

                byUserId.Remove(userId);
                byAccount.Remove(existing.AccountName);
                return ValueTask.FromResult(true);
            }
        }
    }

    private sealed class InMemoryWorlds : IWorldDirectory
    {
        private readonly Dictionary<uint, WorldDestination> destinations = [];

        public void Add(WorldDestination destination) => destinations.Add(destination.WorldId, destination);

        public ValueTask<WorldDestination?> FindAsync(
            uint worldId,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            return ValueTask.FromResult(destinations.GetValueOrDefault(worldId));
        }
    }

    private sealed class FixedTransitionValues : ITransitionValueIssuer
    {
        public int IssueCount { get; private set; }

        public ValueTask<uint> IssueAsync(
            PlayerSession session,
            WorldDestination destination,
            CancellationToken cancellationToken = default)
        {
            cancellationToken.ThrowIfCancellationRequested();
            IssueCount++;
            return ValueTask.FromResult(0x12345678u);
        }
    }

    private sealed record FixedClock(DateTimeOffset UtcNow) : ICoordinatorClock;
}
