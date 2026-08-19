import { backendFetch, clientAddressHeaders, proxyResponse, saveSession, withBackendErrors } from "@/api/backend";
import type { Session } from "@/api/session";

export async function POST(request: Request) {
  return withBackendErrors(async () => {
    const response = await backendFetch("/v1/auth/login", {
      method: "POST",
      body: await request.text(),
      headers: clientAddressHeaders(request),
    });
    if (!response.ok) return proxyResponse(response);
    await saveSession(await response.json() as Session);
    return Response.json({ authenticated: true });
  });
}
