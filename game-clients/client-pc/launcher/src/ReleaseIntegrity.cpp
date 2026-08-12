#include "ReleaseIntegrity.h"
#include "ReleaseSigningPublicKey.h"

#include "miraj_of_icarus/client/ReleaseManifest.h"
#include "miraj_of_icarus/client/windows/WinHttpClient.h"

#include <windows.h>
#include <bcrypt.h>
#include <wincrypt.h>

#include <array>
#include <cstddef>
#include <cstdint>
#include <filesystem>
#include <memory>
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_set>
#include <vector>

namespace miraj_of_icarus::launcher
{
namespace
{
constexpr std::uint64_t MaximumManifestSize = 8 * 1024 * 1024;
constexpr std::uint64_t ReleaseSignatureSize = 384;

struct HandleCloser
{
    void operator()(void* handle) const
    {
        if (handle != nullptr && handle != INVALID_HANDLE_VALUE) CloseHandle(handle);
    }
};
using Handle = std::unique_ptr<void, HandleCloser>;

struct AlgorithmCloser
{
    void operator()(BCRYPT_ALG_HANDLE handle) const
    {
        if (handle != nullptr) BCryptCloseAlgorithmProvider(handle, 0);
    }
};
using Algorithm = std::unique_ptr<void, AlgorithmCloser>;

struct HashCloser
{
    void operator()(BCRYPT_HASH_HANDLE handle) const
    {
        if (handle != nullptr) BCryptDestroyHash(handle);
    }
};
using Hash = std::unique_ptr<void, HashCloser>;

struct KeyCloser
{
    void operator()(BCRYPT_KEY_HANDLE handle) const
    {
        if (handle != nullptr) BCryptDestroyKey(handle);
    }
};
using Key = std::unique_ptr<void, KeyCloser>;

struct LocalMemoryCloser
{
    void operator()(void* memory) const
    {
        if (memory != nullptr) LocalFree(memory);
    }
};
using LocalMemory = std::unique_ptr<void, LocalMemoryCloser>;

[[noreturn]] void Fail(const std::string& message)
{
    throw std::runtime_error(message);
}

Handle OpenRegularFile(const std::wstring& path)
{
    Handle file(CreateFileW(path.c_str(), GENERIC_READ, FILE_SHARE_READ, nullptr, OPEN_EXISTING,
        FILE_ATTRIBUTE_NORMAL | FILE_FLAG_OPEN_REPARSE_POINT | FILE_FLAG_SEQUENTIAL_SCAN, nullptr));
    if (file == nullptr || file.get() == INVALID_HANDLE_VALUE)
    {
        Fail("Release file is missing or unreadable.");
    }
    FILE_ATTRIBUTE_TAG_INFO attributes{};
    if (!GetFileInformationByHandleEx(file.get(), FileAttributeTagInfo, &attributes, sizeof(attributes)) ||
        (attributes.FileAttributes & (FILE_ATTRIBUTE_DIRECTORY | FILE_ATTRIBUTE_REPARSE_POINT)) != 0)
    {
        Fail("Release contains a non-regular file.");
    }
    return file;
}

std::uint64_t FileSize(HANDLE file)
{
    LARGE_INTEGER size{};
    if (!GetFileSizeEx(file, &size) || size.QuadPart < 0)
    {
        Fail("Unable to determine release file size.");
    }
    return static_cast<std::uint64_t>(size.QuadPart);
}

std::string ReadManifest(const std::wstring& path)
{
    auto file = OpenRegularFile(path);
    const auto size = FileSize(file.get());
    if (size == 0 || size > MaximumManifestSize)
    {
        Fail("Release manifest has an invalid size.");
    }
    std::string result(static_cast<std::size_t>(size), '\0');
    DWORD received = 0;
    if (!ReadFile(file.get(), result.data(), static_cast<DWORD>(result.size()), &received, nullptr) ||
        received != result.size())
    {
        Fail("Unable to read release manifest.");
    }
    return result;
}

std::vector<std::uint8_t> ReadSignature(const std::wstring& path)
{
    auto file = OpenRegularFile(path);
    const auto size = FileSize(file.get());
    if (size != ReleaseSignatureSize)
    {
        Fail("Release manifest signature has an invalid size.");
    }
    std::vector<std::uint8_t> result(static_cast<std::size_t>(size));
    DWORD received = 0;
    if (!ReadFile(file.get(), result.data(), static_cast<DWORD>(result.size()), &received, nullptr) ||
        received != result.size())
    {
        Fail("Unable to read release manifest signature.");
    }
    return result;
}

std::string Sha256(HANDLE file)
{
    BCRYPT_ALG_HANDLE rawAlgorithm = nullptr;
    if (BCryptOpenAlgorithmProvider(&rawAlgorithm, BCRYPT_SHA256_ALGORITHM, nullptr, 0) < 0)
    {
        Fail("Unable to initialize SHA-256.");
    }
    Algorithm algorithm(rawAlgorithm);

    BCRYPT_HASH_HANDLE rawHash = nullptr;
    if (BCryptCreateHash(algorithm.get(), &rawHash, nullptr, 0, nullptr, 0, 0) < 0)
    {
        Fail("Unable to initialize the release file hash.");
    }
    Hash hash(rawHash);
    std::vector<std::uint8_t> buffer(1024 * 1024);
    for (;;)
    {
        DWORD received = 0;
        if (!ReadFile(file, buffer.data(), static_cast<DWORD>(buffer.size()), &received, nullptr))
        {
            Fail("Unable to hash a release file.");
        }
        if (received == 0) break;
        if (BCryptHashData(hash.get(), buffer.data(), received, 0) < 0)
        {
            Fail("Unable to hash a release file.");
        }
    }

    std::array<std::uint8_t, 32> digest{};
    if (BCryptFinishHash(hash.get(), digest.data(), static_cast<ULONG>(digest.size()), 0) < 0)
    {
        Fail("Unable to finish the release file hash.");
    }
    constexpr char Hex[] = "0123456789abcdef";
    std::string encoded;
    encoded.reserve(digest.size() * 2);
    for (const auto byte : digest)
    {
        encoded.push_back(Hex[byte >> 4]);
        encoded.push_back(Hex[byte & 0x0f]);
    }
    return encoded;
}

std::array<std::uint8_t, 32> Sha256(std::string_view payload)
{
    BCRYPT_ALG_HANDLE rawAlgorithm = nullptr;
    if (BCryptOpenAlgorithmProvider(&rawAlgorithm, BCRYPT_SHA256_ALGORITHM, nullptr, 0) < 0)
    {
        Fail("Unable to initialize SHA-256.");
    }
    Algorithm algorithm(rawAlgorithm);

    BCRYPT_HASH_HANDLE rawHash = nullptr;
    if (BCryptCreateHash(algorithm.get(), &rawHash, nullptr, 0, nullptr, 0, 0) < 0)
    {
        Fail("Unable to initialize the manifest hash.");
    }
    Hash hash(rawHash);
    if (BCryptHashData(hash.get(),
            reinterpret_cast<PUCHAR>(const_cast<char*>(payload.data())),
            static_cast<ULONG>(payload.size()), 0) < 0)
    {
        Fail("Unable to hash the release manifest.");
    }

    std::array<std::uint8_t, 32> digest{};
    if (BCryptFinishHash(hash.get(), digest.data(), static_cast<ULONG>(digest.size()), 0) < 0)
    {
        Fail("Unable to finish the manifest hash.");
    }
    return digest;
}

void VerifyManifestSignature(std::string_view manifest, std::vector<std::uint8_t>& signature)
{
    CERT_PUBLIC_KEY_INFO* rawPublicKey = nullptr;
    DWORD decodedSize = 0;
    if (!CryptDecodeObjectEx(X509_ASN_ENCODING, X509_PUBLIC_KEY_INFO,
            ReleaseSigningPublicKey, ReleaseSigningPublicKeyLength,
            CRYPT_DECODE_ALLOC_FLAG, nullptr, &rawPublicKey, &decodedSize))
    {
        Fail("Unable to decode the release signing public key.");
    }
    LocalMemory publicKey(rawPublicKey);

    BCRYPT_KEY_HANDLE rawKey = nullptr;
    if (!CryptImportPublicKeyInfoEx2(X509_ASN_ENCODING, rawPublicKey, 0, nullptr, &rawKey))
    {
        Fail("Unable to import the release signing public key.");
    }
    Key key(rawKey);
    auto digest = Sha256(manifest);
    BCRYPT_PKCS1_PADDING_INFO padding{BCRYPT_SHA256_ALGORITHM};
    if (BCryptVerifySignature(key.get(), &padding, digest.data(),
            static_cast<ULONG>(digest.size()), signature.data(),
            static_cast<ULONG>(signature.size()), BCRYPT_PAD_PKCS1) < 0)
    {
        Fail("Release manifest signature is invalid.");
    }
}

void VerifyReleaseInventory(const std::wstring& releaseDirectory,
    const miraj_of_icarus::client::ReleaseManifest& manifest)
{
    std::unordered_set<std::string> expected;
    for (const auto& file : manifest.files) expected.insert(file.path);

    const std::filesystem::path root(releaseDirectory);
    std::error_code error;
    std::filesystem::recursive_directory_iterator entry(root, error);
    const std::filesystem::recursive_directory_iterator end;
    while (entry != end)
    {
        if (error) Fail("Unable to inventory the installed release.");
        const auto attributes = GetFileAttributesW(entry->path().c_str());
        if (attributes == INVALID_FILE_ATTRIBUTES ||
            (attributes & FILE_ATTRIBUTE_REPARSE_POINT) != 0)
        {
            Fail("Release contains an unsupported filesystem entry.");
        }
        if ((attributes & FILE_ATTRIBUTE_DIRECTORY) == 0)
        {
            const auto relative = entry->path().lexically_relative(root).generic_string();
            if (relative != "release-manifest.json" && relative != "release-manifest.sig" &&
                expected.erase(relative) == 0)
            {
                Fail("Release contains an unlisted file: " + relative + ".");
            }
        }
        entry.increment(error);
    }
    if (error || !expected.empty())
    {
        Fail("Installed release does not match its manifest.");
    }
}
}

void VerifyInstalledRelease(const std::wstring& releaseDirectory)
{
    const auto manifest = ReadVerifiedReleaseManifest(releaseDirectory);
    for (const auto& expected : manifest.files)
    {
        if (!IsReleaseFileValid(releaseDirectory, expected))
        {
            Fail("Release integrity check failed for " + expected.path + ".");
        }
    }
    VerifyReleaseInventory(releaseDirectory, manifest);
}

miraj_of_icarus::client::ReleaseManifest ReadVerifiedReleaseManifest(
    const std::wstring& releaseDirectory)
{
    const auto separator = releaseDirectory.ends_with(L'\\') ? L"" : L"\\";
    const auto serializedManifest = ReadManifest(
        releaseDirectory + separator + L"release-manifest.json");
    auto signature = ReadSignature(
        releaseDirectory + separator + L"release-manifest.sig");
    VerifyManifestSignature(serializedManifest, signature);
    return miraj_of_icarus::client::ReleaseManifest::Deserialize(serializedManifest);
}

bool IsReleaseFileValid(const std::wstring& releaseDirectory,
    const miraj_of_icarus::client::ReleaseFile& expected)
{
    try
    {
        const auto separator = releaseDirectory.ends_with(L'\\') ? L"" : L"\\";
        const auto path = releaseDirectory + separator +
            miraj_of_icarus::client::windows::ToWide(expected.path);
        auto file = OpenRegularFile(path);
        return FileSize(file.get()) == expected.size && Sha256(file.get()) == expected.sha256;
    }
    catch (const std::exception&)
    {
        return false;
    }
}
}
