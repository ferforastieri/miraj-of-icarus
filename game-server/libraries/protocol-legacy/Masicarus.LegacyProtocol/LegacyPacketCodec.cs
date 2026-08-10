namespace Masicarus.LegacyProtocol;

public sealed record LegacyPacket(LegacyPacketHeader Header, byte[] Payload);

public static class LegacyPacketCodec
{
    public static byte[] Encode(byte type0, byte type1, byte cryptoType, ReadOnlySpan<byte> payload)
    {
        var wirePayload = LegacyCryptography.TransformForSend(payload, cryptoType);
        var totalSize = checked(LegacyPacketHeader.Size + wirePayload.Length);
        if (totalSize > ushort.MaxValue)
        {
            throw new InvalidDataException("Legacy packet exceeds the unsigned 16-bit size limit.");
        }

        var packet = new byte[totalSize];
        var header = new LegacyPacketHeader((ushort)totalSize, type0, type1, cryptoType, 0);
        header.Write(packet);
        wirePayload.CopyTo(packet.AsSpan(LegacyPacketHeader.Size));
        return packet;
    }

    public static LegacyPacket Decode(ReadOnlySpan<byte> packet)
    {
        var header = LegacyPacketHeader.Parse(packet);
        if (header.TotalSize != packet.Length)
        {
            throw new InvalidDataException(
                $"Declared packet size {header.TotalSize} differs from received size {packet.Length}.");
        }

        var payload = LegacyCryptography.TransformAfterReceive(
            packet[LegacyPacketHeader.Size..],
            header.CryptoType);
        return new LegacyPacket(header, payload);
    }
}
