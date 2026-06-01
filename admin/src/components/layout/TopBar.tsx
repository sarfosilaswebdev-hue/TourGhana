import { useLocation } from "react-router-dom";
import { Shield, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const TITLES: Record<string, string> = {
  "/": "Dashboard",
  "/destinations": "Destinations",
  "/destinations/new": "New Destination",
  "/bookings": "Bookings",
  "/users": "Users",
  "/reviews": "Reviews",
};

export function TopBar() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const editMatch = pathname.match(/^\/destinations\/(.+)\/edit$/);
  const title = editMatch
    ? "Edit Destination"
    : (TITLES[pathname] ?? "Admin");

  return (
    <header className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-30">
      <h2 className="text-foreground font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-xs text-muted">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span>Admin Access</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  );
}
