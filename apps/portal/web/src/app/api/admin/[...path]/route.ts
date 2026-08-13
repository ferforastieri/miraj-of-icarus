import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/lib/server/backend";

async function forward(request: Request, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  const target = `/v1/admin/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`;
  return withBackendErrors(async () => proxyResponse(await authenticatedBackendFetch(target, {
    method: request.method,
    body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
  })));
}

export const GET = forward;
export const POST = forward;
export const PUT = forward;
export const DELETE = forward;
