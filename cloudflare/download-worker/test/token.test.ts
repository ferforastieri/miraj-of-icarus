import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import worker, { type DownloadWorkerEnv } from "../src/index";
import { verifyDownloadToken } from "../src/token";

function encode(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function issue(key: Buffer, claims: object): string {
  const unsigned = `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}`;
  return `${unsigned}.${createHmac("sha256", key).update(unsigned).digest("base64url")}`;
}

test("accepts a matching unexpired release token", async () => {
  const key = Buffer.alloc(32, 7);
  const version = "a".repeat(40);
  const token = issue(key, { sub: "1", ver: version, aud: "miraj-downloads", exp: 200 });
  assert.equal((await verifyDownloadToken(token, key.toString("base64"), version, 100))?.sub, "1");
});

test("rejects expiration, tampering and another release", async () => {
  const key = Buffer.alloc(32, 7);
  const version = "a".repeat(40);
  const token = issue(key, { sub: "1", ver: version, aud: "miraj-downloads", exp: 200 });
  assert.equal(await verifyDownloadToken(token, key.toString("base64"), version, 200), null);
  assert.equal(await verifyDownloadToken(`${token.slice(0, -1)}x`, key.toString("base64"), version, 100), null);
  assert.equal(await verifyDownloadToken(token, key.toString("base64"), "b".repeat(40), 100), null);
});

test("returns 429 with retry metadata when the download limiter rejects", async () => {
  const environment = {
    RELEASES: {},
    DOWNLOAD_AUTHORIZATION_SIGNING_KEY: Buffer.alloc(32, 7).toString("base64"),
    DOWNLOAD_RATE_LIMITER: { limit: async () => ({ success: false }) },
  } as unknown as DownloadWorkerEnv;
  const context = { waitUntil() {} } as unknown as ExecutionContext;
  const response = await worker.fetch(
    new Request("https://downloads.mirajoficarus.com/channels/alpha.json", {
      headers: { "CF-Connecting-IP": "192.0.2.10" },
    }),
    environment,
    context,
  );

  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "10");
  assert.equal(response.headers.get("RateLimit-Limit"), "100");
  assert.deepEqual(await response.json(), { error: "rate_limited" });
});
