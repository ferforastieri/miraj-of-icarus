using System.Buffers.Binary;
using System.Text;

namespace Masicarus.LegacyProtocol;

public static class LegacyLoginMainCodec
{
    public const int RegisterUserRequestSize = 161;
    public const int RegisterUserResultSize = 251;
    public const int KickUserRequestSize = 111;
    public const int KickUserInformSize = 16;
    public const int SelectWorldRequestSize = 12;
    public const int SelectWorldResultSize = 20;

    public static byte[] Encode(RegisterUserRequest message)
    {
        ArgumentNullException.ThrowIfNull(message);
        RequireLength(message.OpaqueSessionBlock40, 40, nameof(message.OpaqueSessionBlock40));

        var payload = new byte[RegisterUserRequestSize];
        WriteLatin1Fixed(payload.AsSpan(0, 101), message.AccountName);
        WriteUInt32(payload, 101, message.LoginConnectionId);
        WriteUInt32(payload, 105, message.LoginConnectionGeneration);
        WriteUInt32(payload, 109, message.OpaqueLoginState);
        payload[113] = message.PushRequested;
        WriteUInt32(payload, 114, message.OpaqueState1);
        payload[118] = message.LegacyConsumedByte;
        payload[119] = message.OpaqueState2;
        payload[120] = 0;
        message.OpaqueSessionBlock40.CopyTo(payload, 121);
        return payload;
    }

    public static RegisterUserRequest DecodeRegisterUserRequest(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, RegisterUserRequestSize);
        return new RegisterUserRequest(
            ReadLatin1Fixed(payload[0..101]),
            ReadUInt32(payload, 101),
            ReadUInt32(payload, 105),
            ReadUInt32(payload, 109),
            payload[113],
            ReadUInt32(payload, 114),
            payload[118],
            payload[119],
            payload[121..161].ToArray());
    }

    public static byte[] Encode(RegisterUserResult message)
    {
        ArgumentNullException.ThrowIfNull(message);
        RequireLength(message.OpaqueProfileBlock67, 67, nameof(message.OpaqueProfileBlock67));

        var payload = new byte[RegisterUserResultSize];
        WriteUInt32(payload, 0, message.Result);
        WriteUInt32(payload, 4, message.LoginConnectionId);
        WriteUInt32(payload, 8, message.LoginConnectionGeneration);
        WriteUInt32(payload, 12, message.UserId);
        WriteUInt32(payload, 16, message.SessionId);
        WriteUInt32(payload, 20, message.OpaqueState1);
        WriteUInt32(payload, 24, message.OpaqueState2);
        WriteUInt32(payload, 28, message.OpaqueState3);
        message.OpaqueProfileBlock67.CopyTo(payload, 32);
        payload[99] = message.OpaqueState4;
        WriteUInt32(payload, 100, 0);
        WriteUInt32(payload, 104, message.OpaqueState5);
        WriteUInt32(payload, 108, message.OpaqueState6);
        WriteUInt32(payload, 112, message.OpaqueState7);
        WriteUInt32(payload, 116, message.OpaqueState8);
        payload[120] = message.OpaqueState9;
        WriteUtf16Fixed(payload.AsSpan(121, 130), message.OpaqueText);
        return payload;
    }

    public static RegisterUserResult DecodeRegisterUserResult(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, RegisterUserResultSize);
        return new RegisterUserResult(
            ReadUInt32(payload, 0),
            ReadUInt32(payload, 4),
            ReadUInt32(payload, 8),
            ReadUInt32(payload, 12),
            ReadUInt32(payload, 16),
            ReadUInt32(payload, 20),
            ReadUInt32(payload, 24),
            ReadUInt32(payload, 28),
            payload[32..99].ToArray(),
            payload[99],
            ReadUInt32(payload, 104),
            ReadUInt32(payload, 108),
            ReadUInt32(payload, 112),
            ReadUInt32(payload, 116),
            payload[120],
            ReadUtf16Fixed(payload[121..251]));
    }

    public static byte[] Encode(KickUserRequest message)
    {
        var payload = new byte[KickUserRequestSize];
        WriteUInt32(payload, 0, message.UserId);
        WriteUInt32(payload, 4, message.SessionId);
        payload[109] = message.KickMode;
        payload[110] = message.Enabled;
        return payload;
    }

    public static KickUserRequest DecodeKickUserRequest(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, KickUserRequestSize);
        return new KickUserRequest(
            ReadUInt32(payload, 0),
            ReadUInt32(payload, 4),
            payload[109],
            payload[110]);
    }

    public static byte[] Encode(KickUserInform message)
    {
        var payload = new byte[KickUserInformSize];
        WriteUInt32(payload, 0, message.LoginConnectionId);
        WriteUInt32(payload, 4, message.LoginConnectionGeneration);
        WriteUInt32(payload, 8, message.KickReason);
        WriteUInt32(payload, 12, message.OpaqueClientValue);
        return payload;
    }

    public static KickUserInform DecodeKickUserInform(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, KickUserInformSize);
        return new KickUserInform(
            ReadUInt32(payload, 0),
            ReadUInt32(payload, 4),
            ReadUInt32(payload, 8),
            ReadUInt32(payload, 12));
    }

    public static byte[] Encode(SelectWorldRequest message)
    {
        var payload = new byte[SelectWorldRequestSize];
        WriteUInt32(payload, 0, message.UserId);
        WriteUInt32(payload, 4, message.SessionId);
        WriteUInt32(payload, 8, message.WorldId);
        return payload;
    }

    public static SelectWorldRequest DecodeSelectWorldRequest(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, SelectWorldRequestSize);
        return new SelectWorldRequest(
            ReadUInt32(payload, 0),
            ReadUInt32(payload, 4),
            ReadUInt32(payload, 8));
    }

    public static byte[] Encode(SelectWorldResult message)
    {
        var payload = new byte[SelectWorldResultSize];
        WriteUInt32(payload, 0, message.Result);
        WriteUInt32(payload, 4, message.WorldId);
        WriteUInt32(payload, 8, message.LoginConnectionId);
        WriteUInt32(payload, 12, message.LoginConnectionGeneration);
        WriteUInt32(payload, 16, message.TransitionValue);
        return payload;
    }

    public static SelectWorldResult DecodeSelectWorldResult(ReadOnlySpan<byte> payload)
    {
        RequireSize(payload, SelectWorldResultSize);
        return new SelectWorldResult(
            ReadUInt32(payload, 0),
            ReadUInt32(payload, 4),
            ReadUInt32(payload, 8),
            ReadUInt32(payload, 12),
            ReadUInt32(payload, 16));
    }

    private static uint ReadUInt32(ReadOnlySpan<byte> payload, int offset) =>
        BinaryPrimitives.ReadUInt32LittleEndian(payload[offset..]);

    private static void WriteUInt32(Span<byte> payload, int offset, uint value) =>
        BinaryPrimitives.WriteUInt32LittleEndian(payload[offset..], value);

    private static void RequireSize(ReadOnlySpan<byte> payload, int expected)
    {
        if (payload.Length != expected)
        {
            throw new InvalidDataException(
                $"Expected a {expected}-byte payload, received {payload.Length} bytes.");
        }
    }

    private static void RequireLength(byte[] value, int expected, string parameterName)
    {
        ArgumentNullException.ThrowIfNull(value, parameterName);
        if (value.Length != expected)
        {
            throw new ArgumentException(
                $"Expected exactly {expected} bytes, received {value.Length}.",
                parameterName);
        }
    }

    private static void WriteLatin1Fixed(Span<byte> destination, string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (value.Length >= destination.Length)
        {
            throw new ArgumentException(
                $"Text must contain at most {destination.Length - 1} characters.",
                nameof(value));
        }

        foreach (var character in value)
        {
            if (character > byte.MaxValue)
            {
                throw new EncoderFallbackException("Text contains a character outside Latin-1.");
            }
        }

        Encoding.Latin1.GetBytes(value, destination);
    }

    private static string ReadLatin1Fixed(ReadOnlySpan<byte> source)
    {
        var terminator = source.IndexOf((byte)0);
        return Encoding.Latin1.GetString(terminator >= 0 ? source[..terminator] : source);
    }

    private static void WriteUtf16Fixed(Span<byte> destination, string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (destination.Length % 2 != 0)
        {
            throw new ArgumentException("UTF-16 destination length must be even.", nameof(destination));
        }

        var characterCapacity = destination.Length / 2;
        if (value.Length >= characterCapacity)
        {
            throw new ArgumentException(
                $"Text must contain at most {characterCapacity - 1} UTF-16 code units.",
                nameof(value));
        }

        Encoding.Unicode.GetBytes(value, destination);
    }

    private static string ReadUtf16Fixed(ReadOnlySpan<byte> source)
    {
        var byteLength = source.Length;
        for (var offset = 0; offset + 1 < source.Length; offset += 2)
        {
            if (source[offset] == 0 && source[offset + 1] == 0)
            {
                byteLength = offset;
                break;
            }
        }

        return Encoding.Unicode.GetString(source[..byteLength]);
    }
}
