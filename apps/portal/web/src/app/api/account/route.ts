import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/app/api/_backend/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch("/v1/auth/me")));
}
