import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "../lib/api";
import type { PaginatedResponse, User } from "../lib/types";
import { toast } from "sonner";

export function useUsers(page = 1) {
  return useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () =>
      adminFetch<PaginatedResponse<User>>(`/admin/users?page=${page}&limit=15`),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
