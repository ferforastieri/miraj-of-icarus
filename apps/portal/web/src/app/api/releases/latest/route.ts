import { backendFetch, proxyResponse, withBackendErrors } from "@/app/api/_backend/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await backendFetch("/v1/client-releases/windows/latest")));
}
