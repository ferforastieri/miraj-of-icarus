using MirajOfIcarus.Api.Authentication;
using MirajOfIcarus.Api.Characters;
using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Api.Security;
using MirajOfIcarus.Application.Administration;
using MirajOfIcarus.Application.Characters;
using MirajOfIcarus.Application.Releases;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Administration;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("v1/admin")]
public sealed class AdministrationController(
    AdministrationService administration,
    CharacterService characters,
    ClientReleaseService releases) : ControllerBase
{
    [HttpGet("overview")]
    [RateLimit("admin-read")]
    public async Task<ActionResult<AdministrationOverviewResponse>> Overview(
        CancellationToken cancellationToken)
    {
        var overview = await administration.OverviewAsync(cancellationToken);
        var releaseResult = await releases.GetLatestAsync(cancellationToken);
        var release = releaseResult.Succeeded ? ToRelease(releaseResult.Value!) : null;
        return Ok(new AdministrationOverviewResponse(
            overview.Accounts, overview.Characters, overview.AvailableServers,
            overview.TotalServers, release));
    }

    [HttpGet("accounts")]
    [RateLimit("admin-read")]
    public async Task<ActionResult<AdministrationAccountPageResponse>> Accounts(
        [FromQuery] string? query, [FromQuery] int page = 1, [FromQuery] int pageSize = 25,
        CancellationToken cancellationToken = default)
    {
        var result = await administration.SearchAccountsAsync(query, page, pageSize, cancellationToken);
        return Ok(new AdministrationAccountPageResponse(
            result.Items.Select(ToAccount).ToArray(), result.Total, result.Page, result.PageSize));
    }

    [HttpGet("accounts/{accountId:long}/characters")]
    [RateLimit("admin-read")]
    public async Task<ActionResult<IReadOnlyList<CharacterResponse>>> Characters(
        long accountId, CancellationToken cancellationToken) =>
        Ok((await administration.ListCharactersAsync(accountId, cancellationToken))
            .Select(value => value.ToResponse()).ToArray());

    [HttpPost("accounts/{accountId:long}/suspend")]
    [RateLimit("admin-write")]
    public async Task<ActionResult<AdministrationAccountResponse>> Suspend(
        long accountId, SuspendAccountRequest request, CancellationToken cancellationToken)
    {
        var result = await administration.SuspendAsync(
            User.GetAccount().AccountId, accountId, request.Reason, cancellationToken);
        return result.Succeeded ? Ok(ToAccount(result.Value!)) : this.ToActionResult(result.Error!);
    }

    [HttpPost("accounts/{accountId:long}/restore")]
    [RateLimit("admin-write")]
    public async Task<ActionResult<AdministrationAccountResponse>> Restore(
        long accountId, CancellationToken cancellationToken)
    {
        var result = await administration.RestoreAsync(
            User.GetAccount().AccountId, accountId, cancellationToken);
        return result.Succeeded ? Ok(ToAccount(result.Value!)) : this.ToActionResult(result.Error!);
    }

    [HttpDelete("accounts/{accountId:long}/characters/{characterId:guid}")]
    [RateLimit("admin-write")]
    public async Task<ActionResult<CharacterResponse>> DeleteCharacter(
        long accountId, Guid characterId, CancellationToken cancellationToken)
    {
        var result = await characters.ScheduleDeletionAsync(accountId, characterId, cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);
        await administration.AuditCharacterActionAsync(User.GetAccount().AccountId,
            "character.schedule-deletion", accountId, characterId, cancellationToken);
        return Accepted(result.Value!.ToResponse());
    }

    [HttpPost("accounts/{accountId:long}/characters/{characterId:guid}/restore")]
    [RateLimit("admin-write")]
    public async Task<ActionResult<CharacterResponse>> RestoreCharacter(
        long accountId, Guid characterId, CancellationToken cancellationToken)
    {
        var result = await characters.RestoreAsync(accountId, characterId, cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);
        await administration.AuditCharacterActionAsync(User.GetAccount().AccountId,
            "character.restore", accountId, characterId, cancellationToken);
        return Ok(result.Value!.ToResponse());
    }

    [HttpPut("game-servers/{serverId}/maintenance")]
    [RateLimit("admin-write")]
    public async Task<ActionResult<MaintenanceResponse>> Maintenance(
        string serverId, SetMaintenanceRequest request, CancellationToken cancellationToken)
    {
        var result = await administration.SetMaintenanceAsync(
            User.GetAccount().AccountId, serverId, request.Enabled, request.Message, cancellationToken);
        return result.Succeeded
            ? Ok(new MaintenanceResponse(result.Value!.ServerId, result.Value.Maintenance,
                result.Value.Message, result.Value.UpdatedAt))
            : this.ToActionResult(result.Error!);
    }

    [HttpGet("audit")]
    [RateLimit("admin-read")]
    public async Task<ActionResult<IReadOnlyList<AdministrationAuditResponse>>> Audit(
        [FromQuery] int take = 50, CancellationToken cancellationToken = default) =>
        Ok((await administration.ListAuditAsync(take, cancellationToken)).Select(value =>
            new AdministrationAuditResponse(value.Id, value.AdministratorAccountId,
                value.Action, value.Target, value.Details, value.CreatedAt)).ToArray());

    private static AdministrationAccountResponse ToAccount(MirajOfIcarus.Domain.Accounts.Account account) =>
        new(account.Id, account.UserName, account.Role.ToString(), account.Status.ToString(),
            account.SuspensionReason, account.SuspendedAt, account.CreatedAt);

    private static ClientReleaseResponse ToRelease(ClientRelease release) =>
        new(release.Version, release.TotalSize, release.LauncherUrl, release.PublishedAt);
}
