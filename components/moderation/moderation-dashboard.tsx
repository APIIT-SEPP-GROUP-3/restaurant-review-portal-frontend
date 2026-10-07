"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { SubmissionDialog } from "@/components/moderation/submission-dialog";
import { ApproveAndReply } from "@/components/moderation/approve-and-reply";
import { ReviewConversation } from "@/components/reviews/review-conversation";
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
  const [publishedTarget, setPublishedTarget] = useState<{ type: QueueType; id: number } | null>(null);

  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"view" | "approve" | "reject" | "reply" | null>(null);
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [replyWorkflowId, setReplyWorkflowId] = useState<number | null>(null);
  const actionLock = useRef(false);

  useEffect(() => {
    if (!successMessage) return;
    const timeout = window.setTimeout(() => setSuccessMessage(""), 6000);
    return () => window.clearTimeout(timeout);
  }, [successMessage]);

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
  }, [canModerate, queueType, status, refreshKey, user?.id]);

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

    if (actionLock.current) return;
    actionLock.current = true;
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
      setModalMode(null);
      setSelectedId(null);
      setPublishedTarget({ type, id });
      setSuccessMessage(
        `${type === "reviews" ? "Review" : "Comment"} #${id} approved successfully.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      actionLock.current = false;
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

    if (actionLock.current) return;
    actionLock.current = true;
    setActionId(rejectTarget.id);
    setErrorMessage("");
    setSuccessMessage("");
    setPublishedTarget(null);

    try {
      if (rejectTarget.type === "reviews") {
        await rejectReview(rejectTarget.id, reason, token);
      } else {
        await rejectComment(rejectTarget.id, reason, token);
      }

      removeModeratedItem(rejectTarget.type, rejectTarget.id);
      setModalMode(null);
      setSelectedId(null);
      setSuccessMessage(
        `${rejectTarget.type === "reviews" ? "Review" : "Comment"} #${rejectTarget.id} rejected successfully.`,
      );
      setRejectTarget(null);
      setRejectionReason("");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      actionLock.current = false;
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

  if (!getAuthToken()) return <AccessMessage title="Session expired" message="Please log in again to open moderation." showLogin />;

  const items = queueType === "reviews" ? reviews : comments;
  const visibleItems = items.filter(item => {
    const restaurant = "restaurant" in item ? item.restaurant : item.review.restaurant;
    const text = "reviewText" in item ? `${item.title ?? ""} ${item.reviewText}` : item.commentText;
    return `${restaurant.name} ${item.user.firstName} ${item.user.lastName} ${text}`.toLowerCase().includes(search.toLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / 10));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visibleItems.slice((currentPage - 1) * 10, currentPage * 10);
  const selected = items.find(item => item.id === selectedId);
  const pages = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(number => number === 1 || number === pageCount || Math.abs(number - currentPage) <= 2);

  function openSubmission(id: number, mode: "view" | "approve" | "reject" | "reply") {
    setSuccessMessage("");
    setSelectedId(id); setModalMode(mode); setErrorMessage(""); setRejectionReason("");
    setRejectTarget(mode === "reject" ? { type: queueType, id } : null);
  }

  function closeSubmission() {
    if (actionId !== null) return;
    if (replyWorkflowId !== null) {
      removeModeratedItem(queueType, replyWorkflowId);
      setSuccessMessage("Submission approved. Any saved response remains in the Pending comments queue.");
      setPublishedTarget({ type: queueType, id: replyWorkflowId });
      setReplyWorkflowId(null);
    }
    setModalMode(null); setSelectedId(null); setRejectTarget(null); setErrorMessage("");
  }

  function changeQueue(type: QueueType) {
    if (type === queueType) return;
    setPage(1); setModalMode(null);
    setIsLoading(true); setQueueType(type); setSelectedId(null); setReplyWorkflowId(null); setSearch("");
    setRejectTarget(null); setErrorMessage(""); setSuccessMessage("");
  }

  function showApproved(type: QueueType, id: number) {
    setIsLoading(true); setQueueType(type); setStatus("APPROVED"); setSearch("");
    setPage(1); setModalMode("view");
    setSelectedId(id); setRejectTarget(null); setReplyWorkflowId(null); setErrorMessage("");
    setRefreshKey(key => key + 1);
  }

  return (
    <section className="moderation-workspace min-h-0 flex-1 overflow-hidden bg-stone-100 text-zinc-950">
      <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-1">
        <aside className="min-h-0 border-b border-stone-200 bg-stone-950 px-5 py-4 text-white lg:h-full lg:overflow-y-auto lg:border-b-0 lg:py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">DineRate workspace</p>
          <h1 className="mt-2 text-xl font-bold">Content moderation</h1>
          <p className="mt-2 text-xs text-white/50">{user.role === "ADMIN" ? "Administrator" : "Moderator"} · {user.firstName}</p>
          <nav aria-label="Moderation queues" className="mt-4 flex gap-2 lg:mt-6 lg:flex-col">
            {(["reviews", "comments"] as const).map(type => <button key={type} type="button" disabled={actionId !== null} aria-pressed={queueType === type} onClick={() => changeQueue(type)} className={`flex-1 rounded-xl px-4 py-3 text-left text-sm font-semibold capitalize disabled:opacity-50 ${queueType === type ? "bg-orange-500 text-white" : "text-white/70 hover:bg-white/10"}`}>{type === "comments" ? "Comments & replies" : "Customer reviews"}</button>)}
          </nav>
          <div className="mt-6 hidden space-y-3 border-t border-white/10 pt-5 lg:block">
            {user.role === "ADMIN" ? <Link href="/manage/restaurants" className="block text-sm text-white/60 hover:text-white">Restaurant management ↗</Link> : null}
            <Link href="/restaurants" className="block text-sm text-white/60 hover:text-white">View public site ↗</Link>
            <p className="pt-4 text-xs leading-6 text-white/40">Review content before publishing. Rejected submissions require a reason.</p>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col">
          <div tabIndex={0} role="region" aria-label="Moderation content" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Moderation / {queueType}</p><h2 className="mt-2 text-3xl font-bold tracking-tight">{queueType === "reviews" ? "Customer reviews" : "Comments & replies"}</h2><p className="mt-2 text-sm text-zinc-500">View a submission or choose an action to open its full details.</p></div>
            <button type="button" disabled={isLoading || actionId !== null} onClick={() => { setIsLoading(true); setErrorMessage(""); setRefreshKey(key => key + 1); }} className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Refresh queue</button>
          </header>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 rounded-full border border-stone-200 bg-white p-1" role="group" aria-label="Submission status">
              {statusOptions.map(option => <button key={option} type="button" disabled={actionId !== null} aria-pressed={status === option} onClick={() => {
                if (option === status) return;
                setPage(1); setModalMode(null); setIsLoading(true); setStatus(option); setSelectedId(null); setRejectTarget(null); setErrorMessage(""); setSuccessMessage("");
              }} className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-50 ${status === option ? "bg-stone-900 text-white" : "text-zinc-500 hover:bg-stone-50"}`}>{option.charAt(0) + option.slice(1).toLowerCase()}</button>)}
            </div>
            <label className="min-w-0 flex-1 sm:max-w-xs"><span className="sr-only">Search loaded submissions</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search restaurant, author or text" className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-zinc-950 outline-none focus:border-orange-500" /></label>
          </div>
          {errorMessage && !modalMode ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{errorMessage}</p> : null}
          {successMessage && (!modalMode || isLoading) ? <div role="status" aria-live="polite" className="fixed right-4 top-20 z-[60] flex max-w-[calc(100vw-2rem)] items-center gap-3 rounded-2xl border border-green-200 bg-white px-5 py-4 text-sm text-green-800 shadow-xl sm:max-w-md"><span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100">✓</span><span>{successMessage}</span>{publishedTarget ? <button type="button" disabled={actionId !== null} onClick={() => showApproved(publishedTarget.type, publishedTarget.id)} className="shrink-0 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50">View approved</button> : null}<button type="button" aria-label="Dismiss notification" onClick={() => setSuccessMessage("")} className="flex size-8 shrink-0 items-center justify-center text-lg text-zinc-500">×</button></div> : null}

          {isLoading ? <p role="status" className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-zinc-500">Loading submissions...</p> : (
            <>
              <div className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4"><h3 className="text-sm font-semibold">{status.charAt(0) + status.slice(1).toLowerCase()} submissions</h3><span className="text-xs text-zinc-500">{visibleItems.length} matching · {items.length} total</span></div>
                {visibleItems.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs text-zinc-500"><tr><th className="px-5 py-3 font-medium">Submission</th><th className="px-4 py-3 font-medium">Author</th><th className="hidden px-4 py-3 font-medium md:table-cell">Received</th><th className="sticky right-0 bg-stone-50 px-4 py-3 text-right font-medium">Actions</th></tr></thead>
                  <tbody className="divide-y divide-stone-100">{pageItems.map(item => {
                    const restaurant = "restaurant" in item ? item.restaurant : item.review.restaurant;
                    const title = "reviewText" in item ? item.title ?? "Dining experience" : item.commentText;
                    return <tr key={item.id} className={selected?.id === item.id ? "group bg-orange-50" : "group hover:bg-stone-50"}>
                      <td className="h-18 max-w-xs px-5 py-3"><button type="button" disabled={actionId !== null} aria-pressed={selected?.id === item.id} onClick={() => openSubmission(item.id, "view")} className="w-full text-left"><span className="block truncate font-semibold">{title}</span><span className="mt-1 block text-xs text-zinc-500">{restaurant.name} · #{item.id}</span></button></td>
                      <td className="px-4 py-4"><span className="block max-w-40 truncate">{item.user.firstName} {item.user.lastName}</span>{item.user.role ? <span className="mt-1 block text-xs capitalize text-zinc-400">{item.user.role.roleName.toLowerCase().replaceAll("_", " ")}</span> : null}</td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-xs text-zinc-500 md:table-cell">{formatDate(item.createdAt)}</td>
                      <td className={`sticky right-0 px-3 py-3 ${selected?.id === item.id ? "bg-orange-50" : "bg-white group-hover:bg-stone-50"}`}>
                        <div className="flex flex-wrap justify-end gap-2">
                          <button type="button" aria-label={`View submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "view")} className="rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-stone-100">View</button>
                          {item.moderationStatus === "PENDING" ? <>
                            <button type="button" aria-label={`Approve submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "approve")} className="rounded-full bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">Approve</button>
                            <button type="button" aria-label={`Reject submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "reject")} className="rounded-full border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                            {user.role === "ADMIN" ? <button type="button" disabled={actionId !== null} onClick={() => openSubmission(item.id, "reply")} className="rounded-full bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600">Approve & reply</button> : null}
                          </> : null}
                        </div>
                      </td>
                    </tr>;
                  })}
                  {Array.from({ length: 10 - pageItems.length }, (_, index) => <tr key={`empty-${index}`} aria-hidden="true"><td colSpan={4} className="h-18" /></tr>)}
                  </tbody>
                </table></div> : <div className="p-8 text-center"><h3 className="font-semibold">{search ? "No matching submissions" : "All caught up"}</h3><p className="mt-2 text-sm text-zinc-500">{search ? "Try another search." : `No ${status.toLowerCase()} ${queueType} to display.`}</p></div>}
              </div>
            </>
          )}

          </div>
          <nav aria-label="Submission pagination" className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-white px-4 py-3 sm:px-6">
            <p className="text-xs text-zinc-500">{isLoading ? "Loading..." : visibleItems.length ? `Showing ${(currentPage - 1) * 10 + 1}–${Math.min(currentPage * 10, visibleItems.length)} of ${visibleItems.length}` : "No submissions"} · 10 per page</p>
            <div className="flex items-center gap-1">
              <button type="button" disabled={isLoading || currentPage === 1} onClick={() => setPage(currentPage - 1)} className="px-3 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
              {pages.map((number, index) => <span key={number} className="flex items-center">{index > 0 && number - pages[index - 1] > 1 ? <span className="px-2 text-zinc-400">…</span> : null}<button type="button" aria-label={`Page ${number}`} aria-current={number === currentPage ? "page" : undefined} disabled={isLoading} onClick={() => setPage(number)} className={`flex size-10 items-center justify-center text-sm font-semibold ${number === currentPage ? "bg-orange-500 text-white" : "hover:bg-stone-100"}`}>{number}</button></span>)}
              <button type="button" disabled={isLoading || currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="px-3 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
            </div>
          </nav>
        </div>
      </div>
      {modalMode && selected && !isLoading ? <SubmissionDialog key={`${queueType}-${selected.id}`} title={`${modalMode === "view" ? "View" : modalMode === "reply" ? "Approve and reply to" : modalMode === "approve" ? "Approve" : "Reject"} ${queueType === "reviews" ? "review" : "comment"} #${selected.id}`} busy={actionId !== null} onClose={closeSubmission} footer={selected.moderationStatus === "PENDING" ? <>
        {modalMode === "reply" ? <button form="moderation-approval-response" type="submit" disabled={actionId !== null} className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Working..." : replyWorkflowId === selected.id ? "Retry response" : "Approve and reply"}</button> : null}
        {selected.moderationStatus === "PENDING" && replyWorkflowId !== selected.id && modalMode !== "reply" ? <>
          {modalMode === "reject" ? <button type="button" disabled={actionId !== null} onClick={() => void handleReject()} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Rejecting..." : "Confirm rejection"}</button> : <button type="button" disabled={actionId !== null} onClick={() => void handleApprove(queueType, selected.id)} className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Approving..." : "Confirm approval"}</button>}
          {modalMode === "view" ? <button type="button" onClick={() => { setModalMode("reject"); setRejectTarget({ type: queueType, id: selected.id }); }} className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600" disabled={actionId !== null}>Reject</button> : null}
          {modalMode === "view" && user.role === "ADMIN" ? <button type="button" disabled={actionId !== null} onClick={() => setModalMode("reply")} className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white">Approve & reply</button> : null}
        </> : null}
      </> : null}>
        {successMessage ? <p role="status" className="mb-4 rounded-2xl bg-green-50 p-4 text-sm text-green-800">{successMessage}</p> : null}
        {"reviewText" in selected ? <ReviewModerationCard review={selected} canReply={user.role === "ADMIN"} /> : <CommentModerationCard comment={selected} canReply={user.role === "ADMIN"} />}
        <Link href={`/restaurants/${"restaurant" in selected ? selected.restaurant.id : selected.review.restaurant.id}`} className="mt-3 inline-flex text-xs font-semibold text-orange-600">View restaurant ↗</Link>
        {modalMode === "reject" ? <div className="mt-5"><label htmlFor="rejection-reason" className="block text-sm font-semibold">Rejection reason</label><textarea autoFocus id="rejection-reason" minLength={5} maxLength={500} rows={3} value={rejectionReason} disabled={actionId !== null} onChange={event => setRejectionReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-300 p-3 text-sm outline-none focus:border-orange-500" /></div> : null}
        {errorMessage ? <p role="alert" className="mt-4 text-sm text-red-700">{errorMessage}</p> : null}
        {modalMode === "reply" && user.role === "ADMIN" && selected.moderationStatus === "PENDING" ? <ApproveAndReply formId="moderation-approval-response" externalSubmit type={queueType} id={selected.id} disabled={actionId !== null} reviewId={"reviewText" in selected ? selected.id : selected.reviewId} onBusy={busy => { if (busy) { setErrorMessage(""); setSuccessMessage(""); } actionLock.current = busy; setActionId(busy ? selected.id : null); }} onOriginalApproved={() => setReplyWorkflowId(selected.id)} onComplete={() => { removeModeratedItem(queueType, selected.id); setReplyWorkflowId(null); setPublishedTarget({ type: queueType, id: selected.id }); setSuccessMessage("Submission and response published successfully."); showApproved(queueType, selected.id); }} /> : null}
      </SubmissionDialog> : null}

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

function ReviewModerationCard({
  review,
  canReply,
}: {
  review: ModerationReview;
  canReply: boolean;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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
      <p className="mt-4 whitespace-pre-line leading-7 text-zinc-700">{review.reviewText}</p>
      {review.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejection reason: {review.rejectionReason}
        </p>
      ) : null}

      {review.moderationStatus === "APPROVED" ? <AdminConversation reviewId={review.id} canReply={canReply} /> : null}
    </article>
  );
}

function CommentModerationCard({
  comment,
  canReply,
}: {
  comment: ModerationComment;
  canReply: boolean;
}) {
  return (
    <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
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
      {comment.review.reviewText ? <blockquote className="mt-4 border-l-2 border-stone-200 pl-4 text-sm text-zinc-500">{comment.review.reviewText}</blockquote> : null}
      <p className="mt-4 whitespace-pre-line leading-7 text-zinc-700">{comment.commentText}</p>
      {comment.rejectionReason ? (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          Rejection reason: {comment.rejectionReason}
        </p>
      ) : null}

      {comment.moderationStatus === "APPROVED" ? <AdminConversation reviewId={comment.reviewId} canReply={canReply} /> : null}
    </article>
  );
}

function AdminConversation({ reviewId, canReply }: { reviewId: number; canReply: boolean }) {
  const [open, setOpen] = useState(true);
  return <div className="mt-5 border-t border-stone-100 pt-4">
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)} className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-700">{open ? "Hide conversation" : canReply ? "View conversation & reply" : "View conversation"}</button>
    {open ? <ReviewConversation key={reviewId} reviewId={reviewId} readOnly={!canReply} /> : null}
  </div>;
}
