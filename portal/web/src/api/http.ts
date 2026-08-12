export class ApiError extends Error {
  constructor(public readonly code: string, public readonly status: number) {
    super(code);
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new ApiError(body?.error ?? "service_unavailable", response.status);
  }
  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
