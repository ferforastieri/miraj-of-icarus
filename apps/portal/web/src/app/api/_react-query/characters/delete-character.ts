import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/app/api/_react-query/http";
import { charactersQueryKey, type Character } from "@/app/api/_react-query/characters/get-characters";

export function deleteCharacter(id: string) {
  return request<Character>(`/api/characters/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function useDeleteCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCharacter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: charactersQueryKey }),
  });
}
