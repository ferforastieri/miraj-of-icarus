import { authenticatedBackendFetch, proxyResponse, withBackendErrors } from "@/app/api/_backend/backend";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return withBackendErrors(async () =>
    proxyResponse(await authenticatedBackendFetch(
      `/v1/account/characters/${encodeURIComponent(id)}/restore`,
      { method: "POST", body: "{}" },
    )));
}
