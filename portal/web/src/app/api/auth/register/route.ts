import { backendFetch, proxyResponse, saveSession, withBackendErrors } from "@/lib/server/backend";
import type { Session } from "@/lib/session";

export async function POST(request: Request) {
  return withBackendErrors(async () => {
    const credentials = await request.json() as { userName: string; password: string };
    const registration = await backendFetch("/v1/accounts", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!registration.ok) return proxyResponse(registration);

    const login = await backendFetch("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    if (!login.ok) return proxyResponse(login);
    await saveSession(await login.json() as Session);
    return Response.json({ authenticated: true }, { status: 201 });
  });
}
