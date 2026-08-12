using Masicarus.Api.Contracts;
using Masicarus.Domain.Game;
using Masicarus.Game.Contracts;
using Masicarus.Infrastructure.Identity;
using Masicarus.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Masicarus.Api.Controllers;

[ApiController]
[Route("v1/account/characters")]
public sealed class CharactersController(
    IDbContextFactory<PlatformDbContext> databaseFactory,
    OpaqueTokenStore tokens,
    TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CharacterResponse>>> ListAsync(
        CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        if (access is null) return Unauthorized(new { error = "invalid_access_token" });

        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var characters = await database.Characters
            .AsNoTracking()
            .Where(character => character.AccountId == access.AccountId)
            .OrderBy(character => character.CreatedAt)
            .Select(character => new CharacterResponse(
                character.Id,
                character.Name,
                character.Archetype,
                character.Gender,
                character.Level,
                character.CreatedAt,
                character.DeletionScheduledAt))
            .ToArrayAsync(cancellationToken);
        return Ok(characters);
    }

    [HttpPost]
    public async Task<ActionResult<CharacterResponse>> CreateAsync(
        CreateCharacterRequest request,
        CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        if (access is null) return Unauthorized(new { error = "invalid_access_token" });

        var name = request.Name.Trim();
        var error = CharacterRules.Validate(name, request.Archetype, request.Gender);
        if (error is not null) return BadRequest(new { error });

        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        await using var transaction = await database.Database.BeginTransactionAsync(cancellationToken);
        await database.Database.ExecuteSqlInterpolatedAsync(
            $"SELECT pg_advisory_xact_lock({access.AccountId})", cancellationToken);
        var count = await database.Characters.CountAsync(
            character => character.AccountId == access.AccountId, cancellationToken);
        if (count >= CharacterRules.MaximumCharactersPerAccount)
        {
            return Conflict(new { error = "character_slots_full" });
        }

        var character = new Character(
            access.AccountId, name, request.Archetype, request.Gender, timeProvider.GetUtcNow());
        database.Characters.Add(character);
        try
        {
            await database.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            return Conflict(new { error = "character_name_unavailable" });
        }

        return Created($"/v1/account/characters/{character.Id}", ToResponse(character));
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<CharacterResponse>> ScheduleDeletionAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        if (access is null) return Unauthorized(new { error = "invalid_access_token" });

        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var character = await database.Characters.SingleOrDefaultAsync(
            value => value.Id == id && value.AccountId == access.AccountId, cancellationToken);
        if (character is null) return NotFound(new { error = "character_not_found" });

        character.ScheduleDeletion(timeProvider.GetUtcNow().Add(CharacterRules.DeletionGracePeriod));
        await database.SaveChangesAsync(cancellationToken);
        return Accepted(ToResponse(character));
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<CharacterResponse>> RestoreAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var access = await AuthenticateAsync(cancellationToken);
        if (access is null) return Unauthorized(new { error = "invalid_access_token" });

        await using var database = await databaseFactory.CreateDbContextAsync(cancellationToken);
        var character = await database.Characters.SingleOrDefaultAsync(
            value => value.Id == id && value.AccountId == access.AccountId, cancellationToken);
        if (character is null) return NotFound(new { error = "character_not_found" });

        character.Restore();
        await database.SaveChangesAsync(cancellationToken);
        return Ok(ToResponse(character));
    }

    private async ValueTask<AccessSession?> AuthenticateAsync(CancellationToken cancellationToken)
    {
        var authorization = Request.Headers.Authorization.ToString();
        const string prefix = "Bearer ";
        if (!authorization.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)) return null;
        var access = await tokens.ReadAsync<AccessSession>(
            "access", authorization[prefix.Length..].Trim(), cancellationToken);
        return access is not null && access.ExpiresAt > timeProvider.GetUtcNow() ? access : null;
    }

    private static CharacterResponse ToResponse(Character character) => new(
        character.Id,
        character.Name,
        character.Archetype,
        character.Gender,
        character.Level,
        character.CreatedAt,
        character.DeletionScheduledAt);
}
