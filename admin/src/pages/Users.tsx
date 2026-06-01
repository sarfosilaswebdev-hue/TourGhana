import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useUsers, useDeleteUser } from "../hooks/useUsers";
import { PageHeader } from "../components/shared/PageHeader";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";

export function Users() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useUsers(page);
  const deleteMutation = useDeleteUser();

  return (
    <div>
      <PageHeader title="Users" subtitle={`${data?.total ?? 0} total`} />

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Email</th>
                <th className="text-left px-4 py-3 font-medium">Interests</th>
                <th className="text-left px-4 py-3 font-medium">Bookings</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
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
              {data?.data.map((user, i) => (
                <tr
                  key={user.id}
                  className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary text-xs font-bold">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <span className="text-foreground font-medium">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{user.email}</td>
                  <td className="px-4 py-3 text-muted">{user.interests?.length ?? 0}</td>
                  <td className="px-4 py-3 text-foreground">{user._count?.bookings ?? 0}</td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteId(user.id)}
                        className="p-1.5 rounded-md text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && !data?.data.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted">
                    No users found
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
        title="Delete User"
        description="This will permanently delete the user and all their data (bookings, reviews, favourites). This action cannot be undone."
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
