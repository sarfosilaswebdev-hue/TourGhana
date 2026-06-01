import { useQuery } from "@tanstack/react-query";
import { adminFetch } from "../lib/api";
import type { Stats } from "../lib/types";

export function useStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminFetch<{ status: string; data: Stats }>("/admin/stats").then((r) => r.data),
  });
}
