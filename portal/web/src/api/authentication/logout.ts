import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/api/http";
import { accountQueryKey } from "@/api/authentication/get-account";

export function logout() {
  return request<void>("/api/auth/logout", { method: "POST" });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries();
      queryClient.setQueryData(accountQueryKey, null);
    },
  });
}
