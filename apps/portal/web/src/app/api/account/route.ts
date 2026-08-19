import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/api/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch("/v1/auth/me")));
}
