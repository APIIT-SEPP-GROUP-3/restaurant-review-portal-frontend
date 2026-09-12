"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import {
  getAuthSessionSnapshot,
  getAuthToken,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
import {
  approveComment,
  approveReview,
  getCommentsForModeration,
  getReviewsForModeration,
  rejectComment,
  rejectReview,
} from "@/services/moderation-service";
import type {
  ModerationComment,
  ModerationReview,
  ModerationStatus,
} from "@/types/moderation";

type QueueType = "reviews" | "comments";
type RejectTarget = { type: QueueType; id: number } | null;

const statusOptions: ModerationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete the moderation request.";
}

export function ModerationDashboard() {
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );
  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  const [queueType, setQueueType] = useState<QueueType>("reviews");
  const [status, setStatus] = useState<ModerationStatus>("PENDING");
  const [reviews, setReviews] = useState<ModerationReview[]>([]);
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const canModerate = user?.role === "MODERATOR" || user?.role === "ADMIN";

  useEffect(() => {
    if (!canModerate) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      return;
    }

    let isActive = true;

    const request =
      queueType === "reviews"
        ? getReviewsForModeration(status, token)
        : getCommentsForModeration(status, token);

    void request
      .then((items) => {
        if (!isActive) {
          return;
        }

        if (queueType === "reviews") {
          setReviews(items as ModerationReview[]);
        } else {
          setComments(items as ModerationComment[]);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [canModerate, queueType, status]);

  function removeModeratedItem(type: QueueType, id: number) {
    if (type === "reviews") {
      setReviews((items) => items.filter((item) => item.id !== id));
    } else {
      setComments((items) => items.filter((item) => item.id !== id));
    }
  }

  async function handleApprove(type: QueueType, id: number) {
    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    setActionId(id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (type === "reviews") {
        await approveReview(id, token);
      } else {
        await approveComment(id, token);
      }

      removeModeratedItem(type, id);
      setSuccessMessage(
        `${type === "reviews" ? "Review" : "Comment"} approved successfully.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  }

  async function handleReject() {
    if (!rejectTarget) {
      return;
    }

    const reason = rejectionReason.trim();
    if (reason.length < 5) {
      setErrorMessage("Rejection reason must be at least 5 characters.");
      return;
    }

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Your session has expired. Please log in again.");
      return;
    }

    setActionId(rejectTarget.id);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (rejectTarget.type === "reviews") {
        await rejectReview(rejectTarget.id, reason, token);
      } else {
        await rejectComment(rejectTarget.id, reason, token);
      }

      removeModeratedItem(rejectTarget.type, rejectTarget.id);
      setSuccessMessage(
        `${rejectTarget.type === "reviews" ? "Review" : "Comment"} rejected successfully.`,
      );
      setRejectTarget(null);
      setRejectionReason("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActionId(null);
    }
  }

  if (!user) {
    return (
      <AccessMessage
        title="Moderator login required"
        message="Log in with a moderator or administrator account to review submitted content."
        showLogin
      />
    );
  }

  if (!canModerate) {
    return (
      <AccessMessage
        title="Access restricted"
        message="Your account does not have permission to access the moderation dashboard."
      />
    );
  }

  const visibleItems = queueType === "reviews" ? reviews : comments;

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Content moderation
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
          Review community submissions
        </h1>
        <p className="mt-4 max-w-3xl text-lg text-zinc-600">
          Approve suitable content or reject it with a clear reason.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
          <div className="flex rounded-xl bg-zinc-100 p-1">
            {(["reviews", "comments"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setErrorMessage("");
                  setQueueType(type);
                  setRejectTarget(null);
                  setSuccessMessage("");
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                  queueType === type
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-zinc-600"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
            Status
            <select
              value={status}
              onChange={(event) => {
                setIsLoading(true);
                setErrorMessage("");
                setStatus(event.target.value as ModerationStatus);
                setRejectTarget(null);
                setSuccessMessage("");
              }}
              className="rounded-xl border border-zinc-300 bg-white px-4 py-2 outline-none focus:border-orange-500"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0) + option.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </label>
        </div>

        {errorMessage ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </p>
        ) : null}

        {isLoading ? (
          <div className="mt-8 rounded-3xl border border-orange-100 bg-white p-10 text-center text-zinc-600">
            Loading {queueType}...
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <h2 className="text-2xl font-bold text-zinc-950">Queue is empty</h2>
            <p className="mt-2 text-zinc-600">
              There are no {status.toLowerCase()} {queueType} to display.
            </p>
          </div>
        ) : queueType === "reviews" ? (
          <div className="mt-8 space-y-5">
            {reviews.map((review) => (
              <ReviewModerationCard
                key={review.id}
                review={review}
                isWorking={actionId === review.id}
                onApprove={() => void handleApprove("reviews", review.id)}
                onReject={() => {
                  setRejectTarget({ type: "reviews", id: review.id });
                  setRejectionReason("");
                }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {comments.map((comment) => (
              <CommentModerationCard
                key={comment.id}
                comment={comment}
                isWorking={actionId === comment.id}
                onApprove={() => void handleApprove("comments", comment.id)}
                onReject={() => {
                  setRejectTarget({ type: "comments", id: comment.id });
                  setRejectionReason("");
                }}
              />
            ))}
          </div>
        )}

        {rejectTarget ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <label htmlFor="rejection-reason" className="block text-sm font-semibold text-red-900">
              Rejection reason
            </label>
            <textarea
              id="rejection-reason"
              rows={3}
              minLength={5}
              maxLength={500}
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Explain why this content cannot be approved"
              className="mt-2 w-full rounded-xl border border-red-200 bg-white px-4 py-3 outline-none focus:border-red-400"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="button"
                disabled={actionId !== null}
                onClick={() => void handleReject()}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                Confirm rejection
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectTarget(null);
                  setRejectionReason("");
                }}
                className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AccessMessage({
  title,
  message,
  showLogin = false,
}: {
  title: string;
  message: string;
  showLogin?: boolean;
}) {
  return (
    <section className="flex flex-1 items-center justify-center bg-orange-50/60 px-4 py-16">
      <div className="max-w-lg rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-950">{title}</h1>
        <p className="mt-3 text-zinc-600">{message}</p>
        {showLogin ? (
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-2.5 font-semibold text-white hover:bg-orange-600">
            Log in
          </Link>
        ) : (
          <Link href="/" className="mt-6 inline-flex font-semibold text-orange-600">
            Return home
          </Link>
        )}
      </div>
    </section>
  );
}

function ModerationActions({
  status,
  isWorking,
  onApprove,
  onReject,
}: {
  status: ModerationStatus;
  isWorking: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  if (status !== "PENDING") {
    return null;
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      <button
        type="button"
        disabled={isWorking}
        onClick={onApprove}
        className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
      >
        {isWorking ? "Working..." : "Approve"}
      </button>
      <button
        type="button"
        disabled={isWorking}
        onClick={onReject}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
      >
        Reject
      </button>
    </div>
  );
}

function ReviewModerationCard({
  review,
  isWorking,
  onApprove,
  onReject,
}: {
  review: ModerationReview;
  isWorking: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-orange-600">
            {review.restaurant.name} · {review.restaurant.city}
          </p>
          <h2 className="mt-2 text-xl font-bold text-zinc-950">
            {review.title ?? "Untitled review"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {review.user.firstName} {review.user.lastName} · {formatDate(review.createdAt)}
          </p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
          ★ {review.overallRating === null ? "—" : Number(review.overallRating).toFixed(1)}
        </span>
      </div>
      <p className="mt-4 leading-7 text-zinc-700">{review.reviewText}</p>
      {review.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejection reason: {review.rejectionReason}
        </p>
      ) : null}
      <ModerationActions
        status={review.moderationStatus}
        isWorking={isWorking}
        onApprove={onApprove}
        onReject={onReject}
      />
    </article>
  );
}

function CommentModerationCard({
  comment,
  isWorking,
  onApprove,
  onReject,
}: {
  comment: ModerationComment;
  isWorking: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <article className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold text-orange-600">
        {comment.review.restaurant.name}
      </p>
      <h2 className="mt-2 text-lg font-bold text-zinc-950">
        Comment on: {comment.review.title ?? "Untitled review"}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        {comment.user.firstName} {comment.user.lastName} · {formatDate(comment.createdAt)}
      </p>
      {comment.parentComment ? (
        <p className="mt-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
          Replying to: {comment.parentComment.commentText}
        </p>
      ) : null}
      <p className="mt-4 leading-7 text-zinc-700">{comment.commentText}</p>
      {comment.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejection reason: {comment.rejectionReason}
        </p>
      ) : null}
      <ModerationActions
        status={comment.moderationStatus}
        isWorking={isWorking}
        onApprove={onApprove}
        onReject={onReject}
      />
    </article>
  );
}
