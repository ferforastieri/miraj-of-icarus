import { cookies } from "next/headers";
import { REFRESH_COOKIE } from "@/lib/session";
import { backendFetch, clearSession } from "@/lib/server/backend";

export async function POST() {
  const refreshToken = (await cookies()).get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    await backendFetch("/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null);
  }
  await clearSession();
  return new Response(null, { status: 204 });
}
