import { useQuery } from "@tanstack/react-query";
import { ApiError, request } from "@/api/http";

export type ClientRelease = {
  version: string;
  totalSize: number;
  launcherUrl: string;
  publishedAt: string;
};

export async function getLatestRelease() {
  try {
    return await request<ClientRelease>("/api/releases/latest");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function useLatestRelease() {
  return useQuery({ queryKey: ["latest-release"], queryFn: getLatestRelease });
}
