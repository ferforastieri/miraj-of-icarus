using Masicarus.Game.Contracts;

namespace Masicarus.MainServer.Coordinator;

public sealed class CoordinatorOrchestrator(
    IPlayerSessionRepository sessions,
    IWorldDirectory worlds,
    ITransitionValueIssuer transitionValues,
    ICoordinatorClock clock)
{
    public async ValueTask<RegisterSessionResult> RegisterAsync(
        RegisterSessionCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);
        ValidateAccountName(command.AccountName);
        RequireNonZero(command.UserId, nameof(command.UserId));
        RequireNonZero(command.SessionId, nameof(command.SessionId));

        var candidate = new PlayerSession(
            command.AccountName,
            command.UserId,
            command.SessionId,
            command.LoginConnection,
            clock.UtcNow);
        var existing = await sessions.TryRegisterAsync(candidate, cancellationToken);
        return existing is null
            ? new RegisterSessionResult(RegisterSessionStatus.Registered, candidate, null)
            : new RegisterSessionResult(RegisterSessionStatus.DuplicateSession, candidate, existing);
    }

    public async ValueTask<KickSessionResult> KickAsync(
        KickSessionCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);
        RequireNonZero(command.UserId, nameof(command.UserId));
        RequireNonZero(command.SessionId, nameof(command.SessionId));

        var existing = await sessions.FindByUserIdAsync(command.UserId, cancellationToken);
        if (existing is null)
        {
            return new KickSessionResult(KickSessionStatus.SessionNotFound, null);
        }

        if (existing.SessionId != command.SessionId)
        {
            return new KickSessionResult(KickSessionStatus.SessionMismatch, existing);
        }

        var removed = await sessions.TryRemoveAsync(
            command.UserId,
            command.SessionId,
            cancellationToken);
        return removed
            ? new KickSessionResult(KickSessionStatus.Removed, existing)
            : new KickSessionResult(KickSessionStatus.SessionMismatch, existing);
    }

    public async ValueTask<SelectWorldResult> SelectWorldAsync(
        SelectWorldCommand command,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(command);
        RequireNonZero(command.UserId, nameof(command.UserId));
        RequireNonZero(command.SessionId, nameof(command.SessionId));
        RequireNonZero(command.WorldId, nameof(command.WorldId));

        var session = await sessions.FindByUserIdAsync(command.UserId, cancellationToken);
        if (session is null)
        {
            return new SelectWorldResult(SelectWorldStatus.SessionNotFound, null, null, 0);
        }

        if (session.SessionId != command.SessionId)
        {
            return new SelectWorldResult(SelectWorldStatus.SessionMismatch, session, null, 0);
        }

        var destination = await worlds.FindAsync(command.WorldId, cancellationToken);
        if (destination is null)
        {
            return new SelectWorldResult(SelectWorldStatus.WorldNotFound, session, null, 0);
        }

        if (!destination.IsAvailable)
        {
            return new SelectWorldResult(
                SelectWorldStatus.WorldUnavailable,
                session,
                destination,
                0);
        }

        var transitionValue = await transitionValues.IssueAsync(
            session,
            destination,
            cancellationToken);
        if (transitionValue == 0)
        {
            throw new InvalidOperationException("Transition issuer returned the reserved zero value.");
        }

        return new SelectWorldResult(
            SelectWorldStatus.Selected,
            session,
            destination,
            transitionValue);
    }

    private static void ValidateAccountName(string accountName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(accountName);
        if (accountName.Length > 100)
        {
            throw new ArgumentOutOfRangeException(
                nameof(accountName),
                "Legacy account names cannot exceed 100 characters.");
        }
    }

    private static void RequireNonZero(uint value, string parameterName)
    {
        if (value == 0)
        {
            throw new ArgumentOutOfRangeException(parameterName, "Zero is reserved.");
        }
    }
}
