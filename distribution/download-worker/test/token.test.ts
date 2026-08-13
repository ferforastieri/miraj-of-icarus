import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
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
