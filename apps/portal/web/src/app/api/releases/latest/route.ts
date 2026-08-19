import { backendFetch, proxyResponse, withBackendErrors } from "@/api/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await backendFetch("/v1/client-releases/windows/latest")));
}
