import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { accountQueryKey } from "@/api/authentication/get-account";

export type LoginInput = { userName: string; password: string };

export function login(input: LoginInput) {
  return request<{ authenticated: true }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountQueryKey }),
  });
}
