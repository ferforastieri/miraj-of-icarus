import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/api/backend";

export async function GET() {
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch("/v1/account/characters")));
}

export async function POST(request: Request) {
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch("/v1/account/characters", {
      method: "POST",
      body: await request.text(),
    })));
}
