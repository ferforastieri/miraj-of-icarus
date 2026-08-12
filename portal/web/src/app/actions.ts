"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  apiFetch,
  authenticatedFetch,
  type Session,
} from "@/lib/api";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

async function saveSession(session: Session) {
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

function value(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

async function errorCode(response: Response) {
  try {
    return String((await response.json()).error ?? "service_unavailable");
  } catch {
    return "service_unavailable";
  }
}

export async function loginAction(formData: FormData) {
  const userName = value(formData, "userName");
  const password = value(formData, "password");
  let response: Response;
  try {
    response = await apiFetch("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ userName, password }),
    });
  } catch {
    redirect("/painel?erro=service_unavailable");
  }
  if (!response.ok) redirect(`/painel?erro=${await errorCode(response)}`);
  await saveSession(await response.json());
  redirect("/painel");
}

export async function registerAction(formData: FormData) {
  const userName = value(formData, "userName");
  const password = value(formData, "password");
  if (password !== value(formData, "passwordConfirmation")) {
    redirect("/painel?modo=cadastro&erro=password_mismatch");
  }
  let response: Response;
  try {
    response = await apiFetch("/v1/accounts", {
      method: "POST",
      body: JSON.stringify({ userName, password }),
    });
  } catch {
    redirect("/painel?modo=cadastro&erro=service_unavailable");
  }
  if (!response.ok) redirect(`/painel?modo=cadastro&erro=${await errorCode(response)}`);

  const login = await apiFetch("/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ userName, password }),
  });
  if (!login.ok) redirect("/painel?erro=invalid_credentials");
  await saveSession(await login.json());
  redirect("/painel");
}

export async function logoutAction() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      await apiFetch("/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } catch { /* Local cookie removal still signs the player out. */ }
  }
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  redirect("/painel");
}

export async function createCharacterAction(formData: FormData) {
  const response = await authenticatedFetch("/v1/account/characters", {
    method: "POST",
    body: JSON.stringify({
      name: value(formData, "name"),
      archetype: value(formData, "archetype"),
      gender: value(formData, "gender"),
    }),
  });
  if (!response?.ok) redirect(`/painel?erro=${response ? await errorCode(response) : "session_expired"}#personagens`);
  redirect("/painel?sucesso=character_created#personagens");
}

export async function scheduleCharacterDeletionAction(formData: FormData) {
  const id = value(formData, "id");
  const name = value(formData, "name");
  if (!id || name !== value(formData, "confirmation")) {
    redirect("/painel?erro=character_confirmation_invalid#personagens");
  }
  const response = await authenticatedFetch(`/v1/account/characters/${id}`, { method: "DELETE" });
  if (!response?.ok) redirect(`/painel?erro=${response ? await errorCode(response) : "session_expired"}#personagens`);
  redirect("/painel?sucesso=character_deletion_scheduled#personagens");
}

export async function restoreCharacterAction(formData: FormData) {
  const id = value(formData, "id");
  const response = await authenticatedFetch(`/v1/account/characters/${id}/restore`, {
    method: "POST",
    body: "{}",
  });
  if (!response?.ok) redirect(`/painel?erro=${response ? await errorCode(response) : "session_expired"}#personagens`);
  redirect("/painel?sucesso=character_restored#personagens");
}
