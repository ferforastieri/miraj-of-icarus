import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { accountQueryKey } from "@/api/authentication/get-account";
export type RegisterInput = {
  userName: string;
  password: string;
  turnstileToken?: string;
};

export function register(input: RegisterInput) {
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
