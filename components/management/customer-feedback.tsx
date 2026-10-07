"use client";

import { useEffect, useState } from "react";
import { FeedbackReviewDetails } from "@/components/management/feedback-review-details";
import { ReviewConversation } from "@/components/reviews/review-conversation";
import { Pagination, WORKSPACE_PAGE_SIZE } from "@/components/workspace/pagination";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { formatDate } from "@/lib/format-date";
import { formatRating } from "@/lib/format-rating";
import { getRestaurantReviews } from "@/services/review-service";
import type { RestaurantReview } from "@/types/review";

export function CustomerFeedback({ restaurantId }: { restaurantId: number }) {
  const [reviews, setReviews] = useState<RestaurantReview[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selected, setSelected] = useState<{ id: number; reply: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    getRestaurantReviews(restaurantId)
      .then(items => { if (active) setReviews(items); })
      .catch(() => { if (active) setError("Unable to load customer feedback. Refresh to try again."); });
    return () => { active = false; };
  }, [restaurantId, refreshKey]);

  const filtered = (reviews ?? []).filter(review =>
    `${review.title ?? ""} ${review.reviewText} ${review.user.firstName} ${review.user.lastName} ${review.menuItem?.name ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / WORKSPACE_PAGE_SIZE)));
  const pageReviews = filtered.slice((currentPage - 1) * WORKSPACE_PAGE_SIZE, currentPage * WORKSPACE_PAGE_SIZE);
  const selectedReview = reviews?.find(review => review.id === selected?.id);
  const loading = reviews === null && !error;

  return <section>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-xl font-bold">Customer feedback</h2>
        <p className="mt-2 text-sm text-panel-muted">View a review and its conversation, or reply to a customer. Responses are published after moderation.</p>
      </div>
      <button type="button" disabled={loading} onClick={() => { setReviews(null); setError(""); setRefreshKey(key => key + 1); }} className="workspace-button">Refresh feedback</button>
    </div>
    <label className="mt-4 block max-w-sm"><span className="sr-only">Search customer feedback</span>
      <input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search customer, review or dish" className="workspace-input text-sm" />
    </label>
    {error ? <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger-text">{error}</p> : null}
    <div className="workspace-card mt-4 overflow-hidden">
      <div className="flex justify-between gap-3 border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">Customer reviews</h3><span className="text-xs text-panel-muted">{filtered.length} matching</span></div>
      {loading ? <p role="status" className="p-8 text-center text-sm text-panel-muted">Loading feedback...</p> : error ? <p className="p-8 text-center text-sm text-panel-muted">Feedback could not be loaded.</p> : !filtered.length ? <p className="p-8 text-center text-sm text-panel-muted">{search ? "No matching reviews. Try another search." : "No customer reviews yet."}</p> :
        <WorkspaceTable label="Customer feedback" header={<tr><th>Review</th><th>Customer</th><th>Rating</th><th className="hidden md:table-cell">Received</th><th>Actions</th></tr>}>
          {pageReviews.map(review => <tr key={review.id}>
            <td className="h-18 max-w-xs px-5 py-3"><button type="button" onClick={() => setSelected({ id: review.id, reply: false })} className="w-full text-left"><span className="block truncate font-semibold">{review.title || "Dining experience"}</span><span className="mt-1 block truncate text-xs text-panel-muted">{review.menuItem?.name ?? `Review #${review.id}`}</span></button></td>
            <td className="px-4 py-3"><span className="block max-w-40 truncate">{review.user.firstName} {review.user.lastName}</span></td>
            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-brand-hover">{formatRating(review.overallRating)}</td>
            <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-panel-muted md:table-cell">{formatDate(review.createdAt)}</td>
            <td className="px-3 py-3"><div className="flex justify-end gap-2">
              <button type="button" aria-label={`View review ${review.id}`} onClick={() => setSelected({ id: review.id, reply: false })} className="workspace-button">View</button>
              <button type="button" aria-label={`Reply to review ${review.id}`} onClick={() => setSelected({ id: review.id, reply: true })} className="workspace-button workspace-button-primary">Reply</button>
            </div></td>
          </tr>)}
        </WorkspaceTable>}
      <Pagination label="Customer feedback pagination" page={currentPage} total={filtered.length} onPageChange={setPage} loading={loading} />
    </div>
    {selectedReview ? <WorkspaceDialog key={selectedReview.id} title={`${selected?.reply ? "Reply to" : "View"} review #${selectedReview.id}`} busy={busy} onClose={() => { if (!busy) setSelected(null); }}>
      <FeedbackReviewDetails review={selectedReview} />
      <ReviewConversation reviewId={selectedReview.id} onBusy={setBusy} focusComposer={selected?.reply} />
    </WorkspaceDialog> : null}
  </section>;
}
