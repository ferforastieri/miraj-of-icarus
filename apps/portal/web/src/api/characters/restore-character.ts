import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { charactersQueryKey, type Character } from "@/api/characters/get-characters";

export function restoreCharacter(id: string) {
  return request<Character>(`/api/characters/${encodeURIComponent(id)}/restore`, {
    method: "POST",
  });
}

export function useRestoreCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreCharacter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: charactersQueryKey }),
  });
}
