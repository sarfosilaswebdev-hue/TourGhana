import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "../lib/api";
import type { Destination } from "../lib/types";
import { toast } from "sonner";

interface DestinationsResponse {
  status: string;
  results: number;
  total: number;
  page: number;
  totalPages: number;
  destinations: Destination[];
}

export function useDestinations(page = 1, search = "", category = "") {
  return useQuery({
    queryKey: ["destinations", page, search, category],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      if (category && category !== "All") params.set("category", category);
      return adminFetch<DestinationsResponse>(`/destinations?${params}`);
    },
  });
}

export function useDestination(id: string) {
  return useQuery({
    queryKey: ["destinations", id],
    queryFn: () =>
      adminFetch<{ status: string; destination: Destination }>(`/destinations/${id}`).then((r) => r.destination),
    enabled: !!id,
  });
}

export function useCreateDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Destination, "id" | "createdAt" | "updatedAt">) =>
      adminFetch<{ status: string; data: Destination }>("/destinations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Destination created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Destination> }) =>
      adminFetch<{ status: string; data: Destination }>(`/destinations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Destination updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteDestination() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/destinations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations"] });
      toast.success("Destination deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
