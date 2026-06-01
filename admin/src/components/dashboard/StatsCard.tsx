import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: number | undefined;
  icon: LucideIcon;
  accent?: "green" | "amber" | "blue" | "purple";
}

const accentClasses = {
  green: "bg-green-500/10 text-green-400",
  amber: "bg-amber-500/10 text-amber-400",
  blue: "bg-blue-500/10 text-blue-400",
  purple: "bg-purple-500/10 text-purple-400",
};

export function StatsCard({ title, value, icon: Icon, accent = "green" }: StatsCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-4">
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", accentClasses[accent])}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-muted text-xs font-medium uppercase tracking-wider">{title}</p>
        <p className="text-foreground text-2xl font-bold mt-0.5">
          {value === undefined ? (
            <span className="inline-block w-12 h-7 bg-border animate-pulse rounded" />
          ) : (
            value.toLocaleString()
          )}
        </p>
      </div>
    </div>
  );
}
