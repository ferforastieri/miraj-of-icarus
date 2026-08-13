import { useQuery } from "@tanstack/react-query";

export type Account = {
  accountId: number;
  userName: string;
  role: "Player" | "Administrator";
  status: "Active" | "Suspended";
};

export const accountQueryKey = ["account"] as const;

export async function getAccount(): Promise<Account | null> {
  const response = await fetch("/api/account");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("service_unavailable");
  return response.json() as Promise<Account>;
}

export function useAccount() {
  return useQuery({ queryKey: accountQueryKey, queryFn: getAccount, retry: false });
}
