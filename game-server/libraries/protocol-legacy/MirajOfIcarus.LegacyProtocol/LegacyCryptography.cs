using System.Security.Cryptography;

namespace MirajOfIcarus.LegacyProtocol;

public static class LegacyCryptography
{
    public const int AesBlockSize = 16;

    private static readonly byte[] Key =
    [
        0xb4, 0x5d, 0xc9, 0xcb, 0xda, 0xfd, 0xb2, 0x8d,
        0xf8, 0x1f, 0xf4, 0xcb, 0xfc, 0xfa, 0x9f, 0xda,
    ];

    public static byte[] TransformForSend(ReadOnlySpan<byte> payload, byte cryptoType)
    {
        return cryptoType switch
        {
            0 => payload.ToArray(),
            1 => Xor(payload),
            2 => EncryptAes(payload),
            _ => throw new NotSupportedException($"Unsupported legacy crypto type: {cryptoType}."),
        };
    }

    public static byte[] TransformAfterReceive(ReadOnlySpan<byte> payload, byte cryptoType)
    {
        return cryptoType switch
        {
            0 => payload.ToArray(),
            1 => Xor(payload),
            2 => DecryptAes(payload),
            _ => throw new NotSupportedException($"Unsupported legacy crypto type: {cryptoType}."),
        };
    }

    private static byte[] Xor(ReadOnlySpan<byte> payload)
    {
        var output = new byte[payload.Length];
        for (var index = 0; index < payload.Length; index++)
        {
            output[index] = (byte)(payload[index] ^ Key[index % 8]);
        }

        return output;
    }

    private static byte[] EncryptAes(ReadOnlySpan<byte> payload)
    {
        var paddedLength = checked((payload.Length + AesBlockSize - 1) / AesBlockSize * AesBlockSize);
        var padded = new byte[paddedLength];
        payload.CopyTo(padded);
        return TransformAes(padded, decrypt: false);
    }

    private static byte[] DecryptAes(ReadOnlySpan<byte> payload)
    {
        if (payload.Length % AesBlockSize != 0)
        {
            throw new InvalidDataException("AES payload length must be a multiple of 16.");
        }

        return TransformAes(payload, decrypt: true);
    }

    private static byte[] TransformAes(ReadOnlySpan<byte> payload, bool decrypt)
    {
        using var aes = Aes.Create();
        aes.Key = Key;
        aes.Mode = CipherMode.ECB;
        aes.Padding = PaddingMode.None;
        using var transform = decrypt ? aes.CreateDecryptor() : aes.CreateEncryptor();
        var input = payload.ToArray();
        return transform.TransformFinalBlock(input, 0, input.Length);
    }
}
