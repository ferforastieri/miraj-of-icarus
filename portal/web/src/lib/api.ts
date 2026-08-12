import "server-only";

import { cookies } from "next/headers";

export const ACCESS_COOKIE = "masicarus_access";
export const REFRESH_COOKIE = "masicarus_refresh";

export type Account = { accountId: number; userName: string };
export type Session = {
  accessToken: string;
  expiresAt: string;
  refreshToken: string;
  refreshExpiresAt: string;
  account: Account;
};
export type GameServer = {
  id: string;
  name: string;
  region: string;
  loginEndpoint: string;
  available: boolean;
};
export type Character = {
  id: string;
  name: string;
  archetype: string;
  gender: string;
  level: number;
  createdAt: string;
  deletionScheduledAt: string | null;
};
export type ClientRelease = {
  version: string;
  totalSize: number;
  manifestUrl: string;
  signatureUrl: string;
  filesBaseUrl: string;
  launcherUrl: string;
  publishedAt: string;
};

export const apiUrl = process.env.MASICARUS_API_INTERNAL_URL ?? "http://127.0.0.1:8080";

export async function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
    cache: "no-store",
  });
}

export async function getAccessToken() {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const token = await getAccessToken();
  if (!token) return null;
  return apiFetch(path, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${token}` },
  });
}

export async function getAccount(): Promise<Account | null> {
  const response = await authenticatedFetch("/v1/auth/me");
  return response?.ok ? response.json() : null;
}

export async function getCharacters(): Promise<Character[]> {
  const response = await authenticatedFetch("/v1/account/characters");
  return response?.ok ? response.json() : [];
}

export async function getServers(): Promise<GameServer[]> {
  try {
    const response = await apiFetch("/v1/game-servers");
    return response.ok ? response.json() : [];
  } catch {
    return [];
  }
}

export async function getRelease(): Promise<ClientRelease | null> {
  try {
    const response = await apiFetch("/v1/client-releases/windows/latest");
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

export function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${Math.ceil(bytes / 1024)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
