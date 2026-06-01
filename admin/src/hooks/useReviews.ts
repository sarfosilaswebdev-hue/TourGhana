import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "../lib/api";
import type { PaginatedResponse, Review } from "../lib/types";
import { toast } from "sonner";

export function useReviews(page = 1) {
  return useQuery({
    queryKey: ["admin", "reviews", page],
    queryFn: () =>
      adminFetch<PaginatedResponse<Review>>(`/admin/reviews?page=${page}&limit=15`),
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/reviews/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Review deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
