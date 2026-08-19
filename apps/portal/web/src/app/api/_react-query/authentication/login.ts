import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/app/api/_react-query/http";
import { accountQueryKey } from "@/app/api/_react-query/authentication/get-account";

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
