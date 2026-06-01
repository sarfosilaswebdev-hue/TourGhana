import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "../lib/api";
import type { Booking, BookingStatus, PaginatedResponse } from "../lib/types";
import { toast } from "sonner";

export function useBookings(page = 1, status = "") {
  return useQuery({
    queryKey: ["admin", "bookings", page, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (status) params.set("status", status);
      return adminFetch<PaginatedResponse<Booking>>(`/admin/bookings?${params}`);
    },
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
      adminFetch(`/admin/bookings/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Booking status updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/bookings/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      toast.success("Booking deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
