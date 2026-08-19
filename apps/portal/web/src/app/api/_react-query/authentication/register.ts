import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/app/api/_react-query/http";
import { accountQueryKey } from "@/app/api/_react-query/authentication/get-account";
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
