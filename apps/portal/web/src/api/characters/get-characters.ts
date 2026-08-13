import { useQuery } from "@tanstack/react-query";
import { request } from "@/api/http";

export type Character = {
  id: string;
  name: string;
  archetype: string;
  gender: string;
  level: number;
  createdAt: string;
  deletionScheduledAt: string | null;
};

export const charactersQueryKey = ["characters"] as const;

export function getCharacters() {
  return request<Character[]>("/api/characters");
}

export function useCharacters(enabled = true) {
  return useQuery({ queryKey: charactersQueryKey, queryFn: getCharacters, enabled });
}
