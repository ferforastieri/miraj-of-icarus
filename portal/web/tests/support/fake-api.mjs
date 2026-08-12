import { createServer } from "node:http";
import { randomUUID } from "node:crypto";

const accounts = new Map();
const accessTokens = new Map();
const refreshTokens = new Map();

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(body === undefined ? "" : JSON.stringify(body));
}

async function body(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

function accountFor(request) {
  const token = request.headers.authorization?.replace(/^Bearer /, "");
  return token ? accessTokens.get(token) : undefined;
}

function session(account) {
  const accessToken = `access-${randomUUID()}`;
  const refreshToken = `refresh-${randomUUID()}`;
  accessTokens.set(accessToken, account);
  refreshTokens.set(refreshToken, account);
  return {
    accessToken,
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken,
    refreshExpiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    account: { accountId: account.id, userName: account.userName },
  };
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1:18080");
  if (url.pathname === "/health") return json(response, 200, { status: "ok" });
  if (url.pathname === "/v1/client-releases/windows/latest") return json(response, 404, { error: "release_not_found" });
  if (url.pathname === "/v1/game-servers") return json(response, 200, [{ id: "alpha", name: "Alpha", region: "BR", loginEndpoint: "login.masicarus.test", available: true }]);

  if (url.pathname === "/v1/accounts" && request.method === "POST") {
    const input = await body(request);
    const normalized = String(input.userName).toUpperCase();
    if (accounts.has(normalized)) return json(response, 409, { error: "account_name_unavailable" });
    const account = { id: accounts.size + 1, userName: input.userName, password: input.password, characters: [] };
    accounts.set(normalized, account);
    return json(response, 201, { accountId: account.id, userName: account.userName });
  }

  if (url.pathname === "/v1/auth/login" && request.method === "POST") {
    const input = await body(request);
    const account = accounts.get(String(input.userName).toUpperCase());
    return account?.password === input.password
      ? json(response, 200, session(account))
      : json(response, 401, { error: "invalid_credentials" });
  }

  if (url.pathname === "/v1/auth/refresh" && request.method === "POST") {
    const input = await body(request);
    const account = refreshTokens.get(input.refreshToken);
    if (!account) return json(response, 401, { error: "invalid_refresh_token" });
    refreshTokens.delete(input.refreshToken);
    return json(response, 200, session(account));
  }

  if (url.pathname === "/v1/auth/logout" && request.method === "POST") {
    const input = await body(request);
    refreshTokens.delete(input.refreshToken);
    response.writeHead(204);
    return response.end();
  }

  const account = accountFor(request);
  if (!account) return json(response, 401, { error: "unauthorized" });
  if (url.pathname === "/v1/auth/me") return json(response, 200, { accountId: account.id, userName: account.userName });
  if (url.pathname === "/v1/account/characters" && request.method === "GET") return json(response, 200, account.characters);
  if (url.pathname === "/v1/account/characters" && request.method === "POST") {
    const input = await body(request);
    const character = {
      id: randomUUID(), name: input.name, archetype: input.archetype, gender: input.gender,
      level: 1, createdAt: new Date().toISOString(), deletionScheduledAt: null,
    };
    account.characters.push(character);
    return json(response, 201, character);
  }

  const characterRoute = url.pathname.match(/^\/v1\/account\/characters\/([^/]+)(\/restore)?$/);
  if (characterRoute) {
    const character = account.characters.find(item => item.id === characterRoute[1]);
    if (!character) return json(response, 404, { error: "character_not_found" });
    if (request.method === "DELETE" && !characterRoute[2]) {
      character.deletionScheduledAt = new Date(Date.now() + 7 * 86_400_000).toISOString();
      return json(response, 202, character);
    }
    if (request.method === "POST" && characterRoute[2]) {
      character.deletionScheduledAt = null;
      return json(response, 200, character);
    }
  }

  return json(response, 404, { error: "not_found" });
});

server.listen(18080, "127.0.0.1");

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
