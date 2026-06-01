import { useBookings } from "../../hooks/useBookings";
import { StatusBadge } from "../shared/StatusBadge";

export function RecentBookings() {
  const { data, isLoading } = useBookings(1, "");

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="p-4 border-b border-border">
        <h3 className="text-foreground font-semibold text-sm">Recent Bookings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted">
              <th className="text-left px-4 py-2.5 font-medium">Guest</th>
              <th className="text-left px-4 py-2.5 font-medium">Destination</th>
              <th className="text-left px-4 py-2.5 font-medium">Tour Date</th>
              <th className="text-left px-4 py-2.5 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/50">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-border animate-pulse rounded w-24" />
                    </td>
                  ))}
                </tr>
              ))}
            {data?.data.slice(0, 10).map((b) => (
              <tr key={b.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                <td className="px-4 py-3 text-foreground">{b.fullName}</td>
                <td className="px-4 py-3 text-muted">{b.destination?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(b.tourDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={b.status} />
                </td>
              </tr>
            ))}
            {!isLoading && !data?.data.length && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted">
                  No bookings yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
