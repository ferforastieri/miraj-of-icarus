using MirajOfIcarus.LegacyProtocol;

namespace MirajOfIcarus.LegacyProtocol.Tests;

public sealed class LegacyPacketCodecTests
{
    [Fact]
    public void HeaderUsesTheProvenSixByteLayout()
    {
        var buffer = new byte[LegacyPacketHeader.Size];
        var header = new LegacyPacketHeader(0x1234, 11, 20, 2, 0xa5);

        header.Write(buffer);

        Assert.Equal("34120b1402a5", Convert.ToHexStringLower(buffer));
        Assert.Equal(header, LegacyPacketHeader.Parse(buffer));
    }

    [Fact]
    public void AesMatchesTheLegacyFixedKeyVector()
    {
        var encrypted = LegacyCryptography.TransformForSend(new byte[16], 2);

        Assert.Equal("e67d4a29f5247e3e74f817e2223c62f0", Convert.ToHexStringLower(encrypted));
        Assert.Equal(new byte[16], LegacyCryptography.TransformAfterReceive(encrypted, 2));
    }

    [Fact]
    public void ClientPayloadIsZeroPaddedBeforeAes()
    {
        var payload = Enumerable.Range(0, 121).Select(value => (byte)value).ToArray();

        var packet = LegacyPacketCodec.Encode(11, 1, 2, payload);
        var decoded = LegacyPacketCodec.Decode(packet);

        Assert.Equal(134, packet.Length);
        Assert.Equal(payload, decoded.Payload[..121]);
        Assert.Equal(new byte[7], decoded.Payload[121..]);
        Assert.Equal((byte)0, decoded.Header.Padding);
    }

    [Fact]
    public void DecoderRejectsDeclaredSizeMismatch()
    {
        var packet = new byte[] { 8, 0, 11, 5, 0, 0, 0 };

        Assert.Throws<InvalidDataException>(() => LegacyPacketCodec.Decode(packet));
    }
}
