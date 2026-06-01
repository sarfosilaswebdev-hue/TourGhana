import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useDestinations, useDeleteDestination } from "../hooks/useDestinations";
import { PageHeader } from "../components/shared/PageHeader";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";
import type { Category } from "../lib/types";

const CATEGORIES: Array<Category | "All"> = ["All", "NATURE", "CULTURAL", "HISTORICAL", "ADVENTURE", "BEACH"];

export function Destinations() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useDestinations(page, search, category);
  const deleteMutation = useDeleteDestination();

  return (
    <div>
      <PageHeader
        title="Destinations"
        subtitle={`${data?.total ?? 0} total`}
        action={
          <button
            onClick={() => navigate("/destinations/new")}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-bg rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Destination
          </button>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as any); setPage(1); }}
          className="px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Region</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Rating</th>
                <th className="text-left px-4 py-3 font-medium">Tags</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-border animate-pulse rounded w-20" />
                      </td>
                    ))}
                  </tr>
                ))}
              {data?.destinations.map((dest, i) => (
                <tr
                  key={dest.id}
                  className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {dest.images[0] ? (
                        <img
                          src={dest.images[0]}
                          alt={dest.name}
                          className="w-8 h-8 rounded-md object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-md bg-border flex-shrink-0" />
                      )}
                      <span className="text-foreground font-medium">{dest.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{dest.region}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full border border-primary/20">
                      {dest.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-secondary font-medium">{dest.rating}</td>
                  <td className="px-4 py-3 text-muted">{dest.tags.length} tags</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/destinations/${dest.id}/edit`)}
                        className="p-1.5 rounded-md text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteId(dest.id)}
                        className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.destinations.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No destinations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-muted text-xs">
              Page {data.page} of {data.totalPages}
            </span>
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
        title="Delete Destination"
        description="This will permanently delete the destination and all associated data. This action cannot be undone."
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
          }
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
