import { useState } from "react";
import { Check, X, Trash2 } from "lucide-react";
import { useBookings, useUpdateBookingStatus, useDeleteBooking } from "../hooks/useBookings";
import { PageHeader } from "../components/shared/PageHeader";
import { StatusBadge } from "../components/shared/StatusBadge";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import type { BookingStatus } from "../lib/types";

const STATUS_OPTS: Array<{ label: string; value: string }> = [
  { label: "All Statuses", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export function Bookings() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useBookings(page, status);
  const updateStatus = useUpdateBookingStatus();
  const deleteMutation = useDeleteBooking();

  function setBookingStatus(id: string, newStatus: BookingStatus) {
    updateStatus.mutate({ id, status: newStatus });
  }

  return (
    <div>
      <PageHeader title="Bookings" subtitle={`${data?.total ?? 0} total`} />

      <div className="flex gap-3 mb-5">
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
        >
          {STATUS_OPTS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left px-4 py-3 font-medium">Guest</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Tour Date</th>
                <th className="text-left px-4 py-3 font-medium">Group</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Booked</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-border animate-pulse rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              {data?.data.map((booking, i) => (
                <tr
                  key={booking.id}
                  className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-foreground font-medium">{booking.fullName}</p>
                      <p className="text-muted text-xs">{booking.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{booking.destination?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(booking.tourDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-muted">{booking.groupSize}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={booking.status} />
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {booking.status !== "CONFIRMED" && (
                        <button
                          onClick={() => setBookingStatus(booking.id, "CONFIRMED")}
                          className="p-1.5 rounded-md text-muted hover:text-green-400 hover:bg-green-500/10 transition-colors"
                          title="Confirm"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {booking.status !== "CANCELLED" && (
                        <button
                          onClick={() => setBookingStatus(booking.id, "CANCELLED")}
                          className="p-1.5 rounded-md text-muted hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteId(booking.id)}
                        className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.data.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-muted">
                    No bookings found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-muted text-xs">Page {data.page} of {data.totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 text-xs border border-border rounded-md text-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Booking"
        description="This will permanently delete this booking record. This action cannot be undone."
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
