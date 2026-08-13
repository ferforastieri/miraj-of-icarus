import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/lib/server/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch("/v1/auth/me")));
}
