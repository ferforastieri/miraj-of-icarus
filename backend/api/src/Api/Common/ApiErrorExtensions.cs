using MirajOfIcarus.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace MirajOfIcarus.Api.Common;

public sealed record ErrorResponse(string Error);

public static class ApiErrorExtensions
{
    public static ObjectResult ToActionResult(
        this ControllerBase controller,
        ApplicationError error)
    {
        var statusCode = error.Type switch
        {
            ApplicationErrorType.Validation => StatusCodes.Status400BadRequest,
            ApplicationErrorType.Unauthorized => StatusCodes.Status401Unauthorized,
            ApplicationErrorType.NotFound => StatusCodes.Status404NotFound,
            ApplicationErrorType.Conflict => StatusCodes.Status409Conflict,
            ApplicationErrorType.Unavailable => StatusCodes.Status503ServiceUnavailable,
            _ => StatusCodes.Status500InternalServerError,
        };
        return controller.StatusCode(statusCode, new ErrorResponse(error.Code));
    }
}
