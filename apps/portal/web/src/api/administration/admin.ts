import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import type { ClientRelease } from "@/api/releases/get-latest-release";
import type { Character } from "@/api/characters/get-characters";

export type AdminOverview = { accounts: number; characters: number; availableServers: number; totalServers: number; release: ClientRelease | null };
export type AdminAccount = { accountId: number; userName: string; role: string; status: string; suspensionReason: string | null; suspendedAt: string | null; createdAt: string };
export type AdminAccountPage = { items: AdminAccount[]; total: number; page: number; pageSize: number };
export type AdminAudit = { id: number; administratorAccountId: number; action: string; target: string; details: string; createdAt: string };

export function useAdminOverview(enabled = true) { return useQuery({ queryKey: ["admin", "overview"], queryFn: () => request<AdminOverview>("/api/admin/overview"), enabled }); }
export function useAdminAccounts(query: string, page: number, enabled = true) { return useQuery({ queryKey: ["admin", "accounts", query, page], queryFn: () => request<AdminAccountPage>(`/api/admin/accounts?query=${encodeURIComponent(query)}&page=${page}&pageSize=20`), enabled }); }
export function useAdminCharacters(accountId: number | null, enabled = true) { return useQuery({ queryKey: ["admin", "characters", accountId], queryFn: () => request<Character[]>(`/api/admin/accounts/${accountId}/characters`), enabled: enabled && accountId !== null }); }
export function useAdminAudit(enabled = true) { return useQuery({ queryKey: ["admin", "audit"], queryFn: () => request<AdminAudit[]>("/api/admin/audit?take=30"), enabled }); }
export function useSuspendAccount() { const client = useQueryClient(); return useMutation({ mutationFn: ({ accountId, reason }: { accountId: number; reason: string }) => request(`/api/admin/accounts/${accountId}/suspend`, { method: "POST", body: JSON.stringify({ reason }) }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin"] }) }); }
export function useRestoreAccount() { const client = useQueryClient(); return useMutation({ mutationFn: (accountId: number) => request(`/api/admin/accounts/${accountId}/restore`, { method: "POST" }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin"] }) }); }
export function useAdminDeleteCharacter() { const client = useQueryClient(); return useMutation({ mutationFn: ({ accountId, characterId }: { accountId: number; characterId: string }) => request(`/api/admin/accounts/${accountId}/characters/${characterId}`, { method: "DELETE" }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin"] }) }); }
export function useAdminRestoreCharacter() { const client = useQueryClient(); return useMutation({ mutationFn: ({ accountId, characterId }: { accountId: number; characterId: string }) => request(`/api/admin/accounts/${accountId}/characters/${characterId}/restore`, { method: "POST" }), onSuccess: () => client.invalidateQueries({ queryKey: ["admin"] }) }); }
export function useSetMaintenance() { const client = useQueryClient(); return useMutation({ mutationFn: ({ serverId, enabled, message }: { serverId: string; enabled: boolean; message?: string }) => request(`/api/admin/game-servers/${serverId}/maintenance`, { method: "PUT", body: JSON.stringify({ enabled, message }) }), onSuccess: () => { client.invalidateQueries({ queryKey: ["admin"] }); client.invalidateQueries({ queryKey: ["game-servers"] }); } }); }
