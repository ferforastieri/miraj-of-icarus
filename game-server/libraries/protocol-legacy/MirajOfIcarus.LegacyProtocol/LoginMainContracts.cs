namespace MirajOfIcarus.LegacyProtocol;

public static class LoginMainPacketTypes
{
    public const byte Type0 = 12;
    public const byte RegisterUserRequest = 20;
    public const byte RegisterUserResult = 21;
    public const byte KickUserRequest = 40;
    public const byte KickUserInform = 41;
    public const byte SelectWorldRequest = 60;
    public const byte SelectWorldResult = 61;
}

public sealed record RegisterUserRequest(
    string AccountName,
    uint LoginConnectionId,
    uint LoginConnectionGeneration,
    uint OpaqueLoginState,
    byte PushRequested,
    uint OpaqueState1,
    byte LegacyConsumedByte,
    byte OpaqueState2,
    byte[] OpaqueSessionBlock40);

public sealed record RegisterUserResult(
    uint Result,
    uint LoginConnectionId,
    uint LoginConnectionGeneration,
    uint UserId,
    uint SessionId,
    uint OpaqueState1,
    uint OpaqueState2,
    uint OpaqueState3,
    byte[] OpaqueProfileBlock67,
    byte OpaqueState4,
    uint OpaqueState5,
    uint OpaqueState6,
    uint OpaqueState7,
    uint OpaqueState8,
    byte OpaqueState9,
    string OpaqueText);

public readonly record struct KickUserRequest(
    uint UserId,
    uint SessionId,
    byte KickMode,
    byte Enabled);

public readonly record struct KickUserInform(
    uint LoginConnectionId,
    uint LoginConnectionGeneration,
    uint KickReason,
    uint OpaqueClientValue);

public readonly record struct SelectWorldRequest(uint UserId, uint SessionId, uint WorldId);

public readonly record struct SelectWorldResult(
    uint Result,
    uint WorldId,
    uint LoginConnectionId,
    uint LoginConnectionGeneration,
    uint TransitionValue);
