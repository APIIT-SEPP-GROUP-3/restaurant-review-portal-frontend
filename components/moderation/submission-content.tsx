"use client";

import { formatDate } from "@/lib/format-date";
import { useState } from "react";
import { ReviewConversation } from "@/components/reviews/review-conversation";
import type { ModerationReview, ModerationComment } from "@/types/moderation";


export function ReviewModerationCard({
  review,
  canReply,
}: {
  review: ModerationReview;
  canReply: boolean;
}) {
  return (
    <article className="rounded-2xl border border-panel-border bg-panel-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-hover">
            {review.restaurant.name} · {review.restaurant.city}
          </p>
          <h2 className="mt-2 text-xl font-bold text-panel-text">
            {review.title ?? "Untitled review"}
          </h2>
          <p className="mt-1 text-sm text-panel-muted">
            {review.user.firstName} {review.user.lastName} · {formatDate(review.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand-hover">
          ★ {review.overallRating === null ? "—" : Number(review.overallRating).toFixed(1)}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-line leading-7 text-zinc-700">{review.reviewText}</p>
      {review.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-text">
          Rejection reason: {review.rejectionReason}
        </p>
      ) : null}

      {review.moderationStatus === "APPROVED" ? <AdminConversation reviewId={review.id} canReply={canReply} /> : null}
    </article>
  );
}

export function CommentModerationCard({
  comment,
  canReply,
}: {
  comment: ModerationComment;
  canReply: boolean;
}) {
  return (
    <article className="rounded-2xl border border-panel-border bg-panel-surface p-6 shadow-sm">
      <p className="text-sm font-semibold text-brand-hover">
        {comment.review.restaurant.name}
      </p>
      <h2 className="mt-2 text-lg font-bold text-panel-text">
        Comment on: {comment.review.title ?? "Untitled review"}
      </h2>
      <p className="mt-1 text-sm text-panel-muted">
        {comment.user.firstName} {comment.user.lastName} · {formatDate(comment.createdAt)}
      </p>
      {comment.parentComment ? (
        <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Replying to: {comment.parentComment.commentText}
        </p>
      ) : null}
      {comment.review.reviewText ? <blockquote className="mt-4 border-l-2 border-panel-border pl-4 text-sm text-panel-muted">{comment.review.reviewText}</blockquote> : null}
      <p className="mt-4 whitespace-pre-line leading-7 text-zinc-700">{comment.commentText}</p>
      {comment.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger-text">
          Rejection reason: {comment.rejectionReason}
        </p>
      ) : null}

      {comment.moderationStatus === "APPROVED" ? <AdminConversation reviewId={comment.reviewId} canReply={canReply} /> : null}
    </article>
  );
}

function AdminConversation({ reviewId, canReply }: { reviewId: number; canReply: boolean }) {
  const [open, setOpen] = useState(true);
  return <div className="mt-5 border-t border-panel-border pt-4">
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="rounded-xl border border-panel-border bg-brand-soft px-4 py-2.5 text-sm font-semibold text-brand-hover">{open ? "Hide conversation" : canReply ? "View conversation & reply" : "View conversation"}</button>
    {open ? <ReviewConversation key={reviewId} reviewId={reviewId} readOnly={!canReply} /> : null}
  </div>;
}
