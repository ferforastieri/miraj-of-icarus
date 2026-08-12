import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { accountQueryKey } from "@/api/authentication/get-account";
import type { LoginInput } from "@/api/authentication/login";

export function register(input: LoginInput) {
  return request<{ authenticated: true }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountQueryKey }),
  });
}
