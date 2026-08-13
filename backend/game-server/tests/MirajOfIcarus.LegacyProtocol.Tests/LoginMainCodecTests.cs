using System.Buffers.Binary;
using MirajOfIcarus.LegacyProtocol;

namespace MirajOfIcarus.LegacyProtocol.Tests;

public sealed class LoginMainCodecTests
{
    [Fact]
    public void RegisterRequestUsesEveryConfirmedOffset()
    {
        var block = Enumerable.Range(1, 40).Select(value => (byte)value).ToArray();
        var message = new RegisterUserRequest(
            "account",
            0x11223344,
            0x55667788,
            3,
            1,
            0xaabbccdd,
            0,
            7,
            block);

        var payload = LegacyLoginMainCodec.Encode(message);
        var decoded = LegacyLoginMainCodec.DecodeRegisterUserRequest(payload);

        Assert.Equal(161, payload.Length);
        Assert.Equal("account", decoded.AccountName);
        Assert.Equal((uint)0x11223344, BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(101)));
        Assert.Equal((uint)0x55667788, BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(105)));
        Assert.Equal((uint)3, BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(109)));
        Assert.Equal((byte)1, payload[113]);
        Assert.Equal((uint)0xaabbccdd, BinaryPrimitives.ReadUInt32LittleEndian(payload.AsSpan(114)));
        Assert.Equal((byte)0, payload[118]);
        Assert.Equal((byte)7, payload[119]);
        Assert.Equal((byte)0, payload[120]);
        Assert.Equal(block, decoded.OpaqueSessionBlock40);
    }

    [Fact]
    public void RegisterResultRoundTripsAndForcesReservedZero()
    {
        var profile = Enumerable.Range(0, 67).Select(value => (byte)value).ToArray();
        var message = new RegisterUserResult(
            0,
            10,
            11,
            12,
            13,
            14,
            15,
            16,
            profile,
            17,
            18,
            19,
            20,
            21,
            22,
            "sessão");

        var payload = LegacyLoginMainCodec.Encode(message);
        var decoded = LegacyLoginMainCodec.DecodeRegisterUserResult(payload);

        Assert.Equal(251, payload.Length);
        Assert.Equal(new byte[4], payload[100..104]);
        Assert.Equal(message.Result, decoded.Result);
        Assert.Equal(message.LoginConnectionId, decoded.LoginConnectionId);
        Assert.Equal(message.LoginConnectionGeneration, decoded.LoginConnectionGeneration);
        Assert.Equal(message.UserId, decoded.UserId);
        Assert.Equal(message.SessionId, decoded.SessionId);
        Assert.Equal(profile, decoded.OpaqueProfileBlock67);
        Assert.Equal("sessão", decoded.OpaqueText);
    }

    [Fact]
    public void KickRequestZeroesTheLegacyStackReservation()
    {
        var message = new KickUserRequest(1, 2, 3, 1);

        var payload = LegacyLoginMainCodec.Encode(message);

        Assert.Equal(111, payload.Length);
        Assert.Equal(new byte[101], payload[8..109]);
        Assert.Equal(message, LegacyLoginMainCodec.DecodeKickUserRequest(payload));
    }

    [Fact]
    public void KickInformUsesFourDwords()
    {
        var message = new KickUserInform(1, 2, 3, 4);

        var payload = LegacyLoginMainCodec.Encode(message);

        Assert.Equal(16, payload.Length);
        Assert.Equal(message, LegacyLoginMainCodec.DecodeKickUserInform(payload));
    }

    [Fact]
    public void SelectWorldPairUsesThreeAndFiveDwords()
    {
        var request = new SelectWorldRequest(1, 2, 3);
        var result = new SelectWorldResult(0, 3, 4, 5, 6);

        var requestPayload = LegacyLoginMainCodec.Encode(request);
        var resultPayload = LegacyLoginMainCodec.Encode(result);

        Assert.Equal(12, requestPayload.Length);
        Assert.Equal(20, resultPayload.Length);
        Assert.Equal(request, LegacyLoginMainCodec.DecodeSelectWorldRequest(requestPayload));
        Assert.Equal(result, LegacyLoginMainCodec.DecodeSelectWorldResult(resultPayload));
    }

    [Fact]
    public void InternalPacketHasNoEncryptionOrPadding()
    {
        var payload = LegacyLoginMainCodec.Encode(new SelectWorldRequest(1, 2, 3));

        var packet = LegacyPacketCodec.Encode(
            LoginMainPacketTypes.Type0,
            LoginMainPacketTypes.SelectWorldRequest,
            0,
            payload);
        var decoded = LegacyPacketCodec.Decode(packet);

        Assert.Equal(18, packet.Length);
        Assert.Equal(payload, decoded.Payload);
    }
}
