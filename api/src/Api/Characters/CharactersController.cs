using MirajOfIcarus.Api.Authentication;
using MirajOfIcarus.Api.Common;
using MirajOfIcarus.Api.Contracts;
using MirajOfIcarus.Application.Characters;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Characters;

[ApiController]
[Authorize]
[Route("v1/account/characters")]
public sealed class CharactersController(CharacterService characters) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CharacterResponse>>> ListAsync(
        CancellationToken cancellationToken)
    {
        var account = User.GetAccount();
        var result = await characters.ListAsync(account.AccountId, cancellationToken);
        return Ok(result.Select(character => character.ToResponse()).ToArray());
    }

    [HttpPost]
    public async Task<ActionResult<CharacterResponse>> CreateAsync(
        CreateCharacterRequest request,
        CancellationToken cancellationToken)
    {
        var result = await characters.CreateAsync(
            User.GetAccount().AccountId,
            request.Name,
            request.Archetype,
            request.Gender,
            cancellationToken);
        if (!result.Succeeded) return this.ToActionResult(result.Error!);
        var character = result.Value!;
        return Created(
            $"/v1/account/characters/{character.Id}", character.ToResponse());
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<CharacterResponse>> ScheduleDeletionAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await characters.ScheduleDeletionAsync(
            User.GetAccount().AccountId, id, cancellationToken);
        return result.Succeeded
            ? Accepted(result.Value!.ToResponse())
            : this.ToActionResult(result.Error!);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<ActionResult<CharacterResponse>> RestoreAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await characters.RestoreAsync(
            User.GetAccount().AccountId, id, cancellationToken);
        return result.Succeeded
            ? Ok(result.Value!.ToResponse())
            : this.ToActionResult(result.Error!);
    }
}
