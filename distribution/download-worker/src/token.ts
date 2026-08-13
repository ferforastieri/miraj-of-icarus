export type DownloadClaims = { sub: string; ver: string; aud: string; exp: number };

const decoder = new TextDecoder();
const encoder = new TextEncoder();

function decodeBase64Url(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, character => character.charCodeAt(0));
}

export async function verifyDownloadToken(
  token: string,
  encodedKey: string,
  version: string,
  now = Math.floor(Date.now() / 1000),
): Promise<DownloadClaims | null> {
  const segments = token.split(".");
  if (segments.length !== 3) return null;
  let claims: DownloadClaims;
  try {
    const header = JSON.parse(decoder.decode(decodeBase64Url(segments[0]))) as { alg?: string; typ?: string };
    claims = JSON.parse(decoder.decode(decodeBase64Url(segments[1]))) as DownloadClaims;
    if (header.alg !== "HS256" || header.typ !== "JWT") return null;
  } catch {
    return null;
  }
  if (claims.aud !== "miraj-downloads" || claims.ver !== version ||
      !claims.sub || !Number.isSafeInteger(claims.exp) || claims.exp <= now) return null;
  const key = await crypto.subtle.importKey(
    "raw", Uint8Array.from(atob(encodedKey), character => character.charCodeAt(0)) as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const valid = await crypto.subtle.verify(
    "HMAC", key, decodeBase64Url(segments[2]) as unknown as BufferSource,
    encoder.encode(`${segments[0]}.${segments[1]}`) as unknown as BufferSource);
  return valid ? claims : null;
}
