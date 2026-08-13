namespace MirajOfIcarus.Application.Common;

public enum ApplicationErrorType
{
    Validation,
    Unauthorized,
    NotFound,
    Conflict,
    Unavailable,
}

public sealed record ApplicationError(string Code, ApplicationErrorType Type);

public sealed record ApplicationResult<T>(T? Value, ApplicationError? Error)
    where T : class
{
    public bool Succeeded => Error is null;
}

public static class ApplicationResult
{
    public static ApplicationResult<T> Success<T>(T value) where T : class =>
        new(value, null);

    public static ApplicationResult<T> Failure<T>(string code, ApplicationErrorType type)
        where T : class =>
        new(default, new ApplicationError(code, type));
}
