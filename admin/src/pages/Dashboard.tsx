import { MapPin, CalendarCheck, Users, Star, Clock } from "lucide-react";
import { useStats } from "../hooks/useStats";
import { useBookings } from "../hooks/useBookings";
import { StatsCard } from "../components/dashboard/StatsCard";
import { RecentBookings } from "../components/dashboard/RecentBookings";
import { PageHeader } from "../components/shared/PageHeader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  CONFIRMED: "#22C55E",
  CANCELLED: "#EF4444",
};

export function Dashboard() {
  const { data: stats } = useStats();
  const { data: bookingsData } = useBookings(1, "");

  const chartData = [
    { name: "Pending", value: stats?.pendingBookings ?? 0 },
    {
      name: "Confirmed",
      value: stats
        ? stats.totalBookings - stats.pendingBookings - (bookingsData?.data.filter((b) => b.status === "CANCELLED").length ?? 0)
        : 0,
    },
    {
      name: "Cancelled",
      value: bookingsData?.data.filter((b) => b.status === "CANCELLED").length ?? 0,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of TourGhana platform"
      />

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        <StatsCard title="Destinations" value={stats?.totalDestinations} icon={MapPin} accent="green" />
        <StatsCard title="Bookings" value={stats?.totalBookings} icon={CalendarCheck} accent="blue" />
        <StatsCard title="Users" value={stats?.totalUsers} icon={Users} accent="purple" />
        <StatsCard title="Reviews" value={stats?.totalReviews} icon={Star} accent="amber" />
        <StatsCard title="Pending" value={stats?.pendingBookings} icon={Clock} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-surface border border-border rounded-xl p-5">
          <h3 className="text-foreground font-semibold text-sm mb-4">Bookings by Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={36}>
              <XAxis dataKey="name" stroke="#6B7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#111A16", border: "1px solid #1E2D25", borderRadius: 8 }}
                labelStyle={{ color: "#F0FDF4" }}
                itemStyle={{ color: "#6B7280" }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={STATUS_COLORS[entry.name.toUpperCase()] ?? "#22C55E"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2">
          <RecentBookings />
        </div>
      </div>
    </div>
  );
}
