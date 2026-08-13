import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { charactersQueryKey, type Character } from "@/api/characters/get-characters";

export type CreateCharacterInput = { name: string; archetype: string; gender: string };

export function createCharacter(input: CreateCharacterInput) {
  return request<Character>("/api/characters", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useCreateCharacter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCharacter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: charactersQueryKey }),
  });
}
