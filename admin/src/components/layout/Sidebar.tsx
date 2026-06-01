import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  Users,
  Star,
  Globe,
} from "lucide-react";
import { cn } from "../../lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/destinations", label: "Destinations", icon: MapPin },
  { to: "/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/users", label: "Users", icon: Users },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-surface border-r border-border flex flex-col fixed top-0 left-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Globe className="w-4 h-4 text-bg" />
          </div>
          <div>
            <span className="text-foreground font-bold text-sm">TourGhana</span>
            <p className="text-muted text-xs">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted hover:text-foreground hover:bg-white/5"
              )
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <p className="text-muted text-xs text-center">v1.0.0 · Admin</p>
      </div>
    </aside>
  );
}
