import { backendFetch, proxyResponse, withBackendErrors } from "@/lib/server/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await backendFetch("/v1/client-releases/windows/latest")));
}
