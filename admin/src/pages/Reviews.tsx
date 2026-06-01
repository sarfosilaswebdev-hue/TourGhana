import { useState } from "react";
import { Trash2, Star } from "lucide-react";
import { useReviews, useDeleteReview } from "../hooks/useReviews";
import { PageHeader } from "../components/shared/PageHeader";
import { ConfirmDialog } from "../components/shared/ConfirmDialog";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i < Math.round(rating) ? "text-secondary fill-secondary" : "text-border"}`}
        />
      ))}
      <span className="text-muted text-xs ml-1">{rating}</span>
    </div>
  );
}

export function Reviews() {
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useReviews(page);
  const deleteMutation = useDeleteReview();

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${data?.total ?? 0} total`} />

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Destination</th>
                <th className="text-left px-4 py-3 font-medium">Rating</th>
                <th className="text-left px-4 py-3 font-medium">Comment</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
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
              {data?.data.map((review, i) => (
                <tr
                  key={review.id}
                  className={`border-b border-border/50 hover:bg-white/2 transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}
                >
                  <td className="px-4 py-3 text-foreground">
                    {review.user
                      ? `${review.user.firstName} ${review.user.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">{review.destination?.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StarRating rating={review.rating} />
                  </td>
                  <td className="px-4 py-3 text-muted max-w-xs">
                    <span className="truncate block">
                      {review.comment ?? <span className="italic text-muted/60">No comment</span>}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteId(review.id)}
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
                    No reviews found
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
        title="Delete Review"
        description="This will permanently delete this review. This action cannot be undone."
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
