import { verifyDownloadToken } from "./token";

interface Env {
  RELEASES: R2Bucket;
  DOWNLOAD_AUTHORIZATION_SIGNING_KEY: string;
}

const releasePattern = /^releases\/([0-9a-f]{40})\/(launcher|client)\/(.+)$/;

function error(status: number, code: string): Response {
  return Response.json({ error: code }, { status, headers: { "Cache-Control": "no-store" } });
}

function cacheControl(key: string): string {
  return key === "channels/alpha.json"
    ? "public, max-age=30, must-revalidate"
    : "public, max-age=31536000, immutable";
}

export default {
  async fetch(request: Request, env: Env, context: ExecutionContext): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") return error(405, "method_not_allowed");
    const url = new URL(request.url);
    const key = decodeURIComponent(url.pathname.replace(/^\/+/, ""));
    if (!key || key.includes("..") || key.includes("\\")) return error(404, "not_found");

    const release = releasePattern.exec(key);
    const publicObject = key === "channels/alpha.json" ||
      (release?.[2] === "launcher" && release[3] === "MirajOfIcarusLauncher.zip");
    if (!publicObject) {
      if (!release || release[2] !== "client") return error(404, "not_found");
      const authorization = request.headers.get("Authorization");
      if (!authorization?.startsWith("Bearer ")) return error(401, "download_authorization_required");
      const claims = await verifyDownloadToken(
        authorization.slice(7).trim(), env.DOWNLOAD_AUTHORIZATION_SIGNING_KEY, release[1]);
      if (!claims) return error(403, "invalid_download_authorization");
    }

    const ranged = request.headers.has("Range");
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheKey = new Request(`${url.origin}/${encodeURI(key)}`, { method: request.method });
    if (!ranged) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    const object = await env.RELEASES.get(key, ranged ? { range: request.headers } : undefined);
    if (!object) return error(404, "not_found");
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("ETag", object.httpEtag);
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", cacheControl(key));
    const range = "range" in object ? object.range : undefined;
    if (range && "offset" in range && range.offset !== undefined && range.length !== undefined) {
      headers.set("Content-Range", `bytes ${range.offset}-${range.offset + range.length - 1}/${object.size}`);
      headers.set("Content-Length", String(range.length));
    } else {
      headers.set("Content-Length", String(object.size));
    }
    const response = new Response(request.method === "HEAD" ? null : object.body, {
      status: range ? 206 : 200,
      headers,
    });
    if (!ranged && request.method === "GET") context.waitUntil(cache.put(cacheKey, response.clone()));
    return response;
  },
} satisfies ExportedHandler<Env>;
