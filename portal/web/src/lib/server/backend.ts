import "server-only";

import { cookies } from "next/headers";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  apiUrl,
  type Session,
} from "@/lib/session";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(`${apiUrl}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...init.headers },
    cache: "no-store",
  });
}

export async function saveSession(session: Session) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, session.accessToken, {
    ...cookieOptions,
    expires: new Date(session.expiresAt),
  });
  store.set(REFRESH_COOKIE, session.refreshToken, {
    ...cookieOptions,
    expires: new Date(session.refreshExpiresAt),
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

async function refreshSession(refreshToken: string) {
  const response = await backendFetch("/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  if (!response.ok) {
    await clearSession();
    return null;
  }

  const session = await response.json() as Session;
  await saveSession(session);
  return session;
}

export async function authenticatedBackendFetch(path: string, init: RequestInit = {}) {
  const store = await cookies();
  let accessToken = store.get(ACCESS_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (!accessToken) {
    if (!refreshToken) return null;
    const session = await refreshSession(refreshToken);
    if (!session) return null;
    accessToken = session.accessToken;
  }

  let response = await backendFetch(path, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${accessToken}` },
  });
  if (response.status !== 401) return response;

  if (!refreshToken) return response;
  const session = await refreshSession(refreshToken);
  if (!session) return response;
  response = await backendFetch(path, {
    ...init,
    headers: { ...init.headers, authorization: `Bearer ${session.accessToken}` },
  });
  return response;
}

export async function proxyResponse(response: Response | null) {
  if (!response) {
    return Response.json({ error: "session_expired" }, { status: 401 });
  }
  const body = response.status === 204 ? null : await response.text();
  return new Response(body, {
    status: response.status,
    headers: body ? { "content-type": response.headers.get("content-type") ?? "application/json" } : undefined,
  });
}

export function serviceUnavailableResponse() {
  return Response.json({ error: "service_unavailable" }, { status: 503 });
}

export async function withBackendErrors(operation: () => Promise<Response>) {
  try {
    return await operation();
  } catch {
    return serviceUnavailableResponse();
  }
}
