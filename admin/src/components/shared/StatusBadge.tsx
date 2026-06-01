import { cn } from "../../lib/utils";
import type { BookingStatus } from "../../lib/types";

const config: Record<BookingStatus, { label: string; classes: string }> = {
  PENDING: { label: "Pending", classes: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  CONFIRMED: { label: "Confirmed", classes: "bg-green-500/15 text-green-400 border-green-500/30" },
  CANCELLED: { label: "Cancelled", classes: "bg-red-500/15 text-red-400 border-red-500/30" },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const { label, classes } = config[status] ?? config.PENDING;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border", classes)}>
      {label}
    </span>
  );
}
