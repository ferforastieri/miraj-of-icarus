import { backendFetch, proxyResponse, saveSession, withBackendErrors } from "@/lib/server/backend";
import type { Session } from "@/lib/session";

export async function POST(request: Request) {
  return withBackendErrors(async () => {
    const response = await backendFetch("/v1/auth/login", {
      method: "POST",
      body: await request.text(),
    });
    if (!response.ok) return proxyResponse(response);
    await saveSession(await response.json() as Session);
    return Response.json({ authenticated: true });
  });
}
