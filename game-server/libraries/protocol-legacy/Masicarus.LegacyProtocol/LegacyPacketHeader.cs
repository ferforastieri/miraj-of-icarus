using System.Buffers.Binary;

namespace Masicarus.LegacyProtocol;

public readonly record struct LegacyPacketHeader(
    ushort TotalSize,
    byte Type0,
    byte Type1,
    byte CryptoType,
    byte Padding = 0)
{
    public const int Size = 6;

    public static LegacyPacketHeader Parse(ReadOnlySpan<byte> source)
    {
        if (source.Length < Size)
        {
            throw new InvalidDataException("Packet is shorter than the six-byte header.");
        }

        return new LegacyPacketHeader(
            BinaryPrimitives.ReadUInt16LittleEndian(source),
            source[2],
            source[3],
            source[4],
            source[5]);
    }

    public void Write(Span<byte> destination)
    {
        if (TotalSize < Size)
        {
            throw new InvalidDataException("Total packet size cannot be smaller than the header.");
        }

        if (destination.Length < Size)
        {
            throw new ArgumentException("Destination is shorter than the header.", nameof(destination));
        }

        BinaryPrimitives.WriteUInt16LittleEndian(destination, TotalSize);
        destination[2] = Type0;
        destination[3] = Type1;
        destination[4] = CryptoType;
        destination[5] = Padding;
    }
}
