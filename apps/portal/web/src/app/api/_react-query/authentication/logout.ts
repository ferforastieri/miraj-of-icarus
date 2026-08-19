import { useMutation, useQueryClient } from "@tanstack/react-query";
import { request } from "@/app/api/_react-query/http";
import { accountQueryKey } from "@/app/api/_react-query/authentication/get-account";

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
