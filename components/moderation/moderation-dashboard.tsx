"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { WorkspaceToast } from "@/components/workspace/workspace-toast";
import { WorkspaceMessage } from "@/components/workspace/workspace-message";
import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { WorkspaceShell, WorkspaceSidebar, WorkspaceHeader } from "@/components/workspace/workspace-shell";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { Pagination, WORKSPACE_PAGE_SIZE } from "@/components/workspace/pagination";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { ApproveAndReply } from "@/components/moderation/approve-and-reply";
import { ReviewModerationCard, CommentModerationCard } from "@/components/moderation/submission-content";
import { formatDate } from "@/lib/format-date";
import { ApiError } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
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


function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete the moderation request.";
}

export function ModerationDashboard() {
  const user = useAuthUser();


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
      <WorkspaceMessage
        title="Moderator login required"
        message="Log in with a moderator or administrator account to review submitted content."
        href="/login" action="Log in"
      />
    );
  }

  if (!canModerate) {
    return (
      <WorkspaceMessage
        title="Access restricted"
        message="Your account does not have permission to access the moderation dashboard."
      />
    );
  }

  if (!getAuthToken()) return <WorkspaceMessage title="Session expired" message="Please log in again to open moderation." href="/login" action="Log in" />;

  const items = queueType === "reviews" ? reviews : comments;
  const visibleItems = items.filter(item => {
    const restaurant = "restaurant" in item ? item.restaurant : item.review.restaurant;
    const text = "reviewText" in item ? `${item.title ?? ""} ${item.reviewText}` : item.commentText;
    return `${restaurant.name} ${item.user.firstName} ${item.user.lastName} ${text}`.toLowerCase().includes(search.toLowerCase());
  });
  const pageCount = Math.max(1, Math.ceil(visibleItems.length / WORKSPACE_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = visibleItems.slice((currentPage - 1) * WORKSPACE_PAGE_SIZE, currentPage * WORKSPACE_PAGE_SIZE);
  const selected = items.find(item => item.id === selectedId);


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
    <>
    <WorkspaceShell className="moderation-workspace" label="Moderation content" sidebar={
      <WorkspaceSidebar title="Content moderation" identity={`${user.role === "ADMIN" ? "Administrator" : "Moderator"} · ${user.firstName}`} navigation={
        <WorkspaceNavigation label="Moderation queues" active={queueType} disabled={actionId !== null} onSelect={type => changeQueue(type as QueueType)} items={[
          { id: "reviews", label: "Customer reviews" }, { id: "comments", label: "Comments & replies" },
        ]} />
      }>
        {user.role === "ADMIN" ? <Link href="/manage/restaurants" className="block text-sm text-white/60 hover:text-white">Restaurant management ↗</Link> : null}
        <p className="pt-4 text-xs leading-6 text-white/40">Review content before publishing. Rejected submissions require a reason.</p>
      </WorkspaceSidebar>
    } footer={<Pagination label="Submission pagination" page={currentPage} total={visibleItems.length} onPageChange={setPage} loading={isLoading} />}>
          <WorkspaceHeader breadcrumb={`Moderation / ${queueType}`} title={queueType === "reviews" ? "Customer reviews" : "Comments & replies"} description="View a submission or choose an action to open its full details." actions={
            <button type="button" disabled={isLoading || actionId !== null} onClick={() => { setIsLoading(true); setErrorMessage(""); setRefreshKey(key => key + 1); }} className="workspace-button">Refresh queue</button>
          } />
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <WorkspaceTabs label="Submission status" options={statusOptions.map(value => ({ value, label: value.charAt(0) + value.slice(1).toLowerCase() }))} value={status} disabled={actionId !== null} onChange={option => {
              if (option === status) return;
              setPage(1); setModalMode(null); setIsLoading(true); setStatus(option); setSelectedId(null); setRejectTarget(null); setErrorMessage(""); setSuccessMessage("");
            }} />
            <label className="min-w-0 flex-1 sm:max-w-xs"><span className="sr-only">Search loaded submissions</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search restaurant, author or text" className="workspace-input text-sm" /></label>
          </div>
          {errorMessage && !modalMode ? <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-4 text-sm text-danger-text">{errorMessage}</p> : null}
          {successMessage && (!modalMode || isLoading) ? <WorkspaceToast message={successMessage} onDismiss={() => setSuccessMessage("")} action={publishedTarget ? <button type="button" disabled={actionId !== null} onClick={() => showApproved(publishedTarget.type, publishedTarget.id)} className="shrink-0 px-3 py-2 text-xs font-semibold text-brand-hover hover:bg-brand-soft">View approved</button> : null} /> : null}

          {isLoading ? <p role="status" className="mt-6 rounded-2xl bg-panel-surface p-8 text-center text-sm text-panel-muted">Loading submissions...</p> : (
            <>
              <div className="workspace-card mt-5 overflow-hidden">
                <div className="flex items-center justify-between border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">{status.charAt(0) + status.slice(1).toLowerCase()} submissions</h3><span className="text-xs text-panel-muted">{visibleItems.length} matching · {items.length} total</span></div>
                {visibleItems.length ? <WorkspaceTable onRowClick={id => openSubmission(id, "view")} label="Moderation submissions" header={<tr><th className="px-5 py-3 font-medium">Submission</th><th className="px-4 py-3 font-medium">Author</th><th className="hidden px-4 py-3 font-medium md:table-cell">Received</th><th className="sticky right-0 bg-panel-subtle px-4 py-3 text-right font-medium">Actions</th></tr>}>{pageItems.map(item => {
                    const restaurant = "restaurant" in item ? item.restaurant : item.review.restaurant;
                    const title = "reviewText" in item ? item.title ?? "Dining experience" : item.commentText;
                    return <tr key={item.id} data-record-id={item.id} aria-selected={selected?.id === item.id}>
                      <td className="h-18 max-w-xs px-5 py-3"><button type="button" disabled={actionId !== null} aria-pressed={selected?.id === item.id} onClick={() => openSubmission(item.id, "view")} className="w-full text-left"><span className="block truncate font-semibold">{title}</span><span className="mt-1 block text-xs text-panel-muted">{restaurant.name} · #{item.id}</span></button></td>
                      <td className="px-4 py-4"><span className="block max-w-40 truncate">{item.user.firstName} {item.user.lastName}</span>{item.user.role ? <span className="mt-1 block text-xs capitalize text-zinc-400">{item.user.role.roleName.toLowerCase().replaceAll("_", " ")}</span> : null}</td>
                      <td className="hidden whitespace-nowrap px-4 py-4 text-xs text-panel-muted md:table-cell">{formatDate(item.createdAt)}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button type="button" aria-label={`View submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "view")} className="rounded-full border border-panel-border bg-panel-surface px-3 py-2 text-xs font-semibold hover:bg-stone-100">View</button>
                          {item.moderationStatus === "PENDING" ? <>
                            <button type="button" aria-label={`Approve submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "approve")} className="rounded-full bg-success px-3 py-2 text-xs font-semibold text-white hover:bg-success-hover">Approve</button>
                            <button type="button" aria-label={`Reject submission ${item.id}`} disabled={actionId !== null} onClick={() => openSubmission(item.id, "reject")} className="rounded-full border border-danger-border bg-panel-surface px-3 py-2 text-xs font-semibold text-danger hover:bg-danger-soft">Reject</button>
                            {user.role === "ADMIN" ? <button type="button" disabled={actionId !== null} onClick={() => openSubmission(item.id, "reply")} className="rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white hover:bg-brand-hover">Approve & reply</button> : null}
                          </> : null}
                        </div>
                      </td>
                    </tr>;
                  })}
</WorkspaceTable> : <div className="p-8 text-center"><h3 className="font-semibold">{search ? "No matching submissions" : "All caught up"}</h3><p className="mt-2 text-sm text-panel-muted">{search ? "Try another search." : `No ${status.toLowerCase()} ${queueType} to display.`}</p></div>}
              </div>
            </>
          )}

    </WorkspaceShell>
      {modalMode && selected && !isLoading ? <WorkspaceDialog key={`${queueType}-${selected.id}`} title={`${modalMode === "view" ? "View" : modalMode === "reply" ? "Approve and reply to" : modalMode === "approve" ? "Approve" : "Reject"} ${queueType === "reviews" ? "review" : "comment"} #${selected.id}`} busy={actionId !== null} onClose={closeSubmission} footer={selected.moderationStatus === "PENDING" ? <>
        {modalMode === "reply" ? <button form="moderation-approval-response" type="submit" disabled={actionId !== null} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Working..." : replyWorkflowId === selected.id ? "Retry response" : "Approve and reply"}</button> : null}
        {selected.moderationStatus === "PENDING" && replyWorkflowId !== selected.id && modalMode !== "reply" ? <>
          {modalMode === "reject" ? <button type="button" disabled={actionId !== null} onClick={() => void handleReject()} className="rounded-full bg-danger px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Rejecting..." : "Confirm rejection"}</button> : <button type="button" disabled={actionId !== null} onClick={() => void handleApprove(queueType, selected.id)} className="rounded-full bg-success px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{actionId !== null ? "Approving..." : "Confirm approval"}</button>}
          {modalMode === "view" ? <button type="button" onClick={() => { setModalMode("reject"); setRejectTarget({ type: queueType, id: selected.id }); }} className="rounded-full border border-danger-border px-5 py-2.5 text-sm font-semibold text-danger" disabled={actionId !== null}>Reject</button> : null}
          {modalMode === "view" && user.role === "ADMIN" ? <button type="button" disabled={actionId !== null} onClick={() => setModalMode("reply")} className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white">Approve & reply</button> : null}
        </> : null}
      </> : null}>
        {successMessage ? <p role="status" className="mb-4 rounded-2xl bg-success-soft p-4 text-sm text-success-text">{successMessage}</p> : null}
        {"reviewText" in selected ? <ReviewModerationCard review={selected} canReply={user.role === "ADMIN"} /> : <CommentModerationCard comment={selected} canReply={user.role === "ADMIN"} />}
        <Link href={`/restaurants/${"restaurant" in selected ? selected.restaurant.id : selected.review.restaurant.id}`} className="mt-3 inline-flex text-xs font-semibold text-brand-hover">View restaurant ↗</Link>
        {modalMode === "reject" ? <div className="mt-5"><label htmlFor="rejection-reason" className="block text-sm font-semibold">Rejection reason</label><textarea autoFocus id="rejection-reason" minLength={5} maxLength={500} rows={3} value={rejectionReason} disabled={actionId !== null} onChange={event => setRejectionReason(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-300 p-3 text-sm outline-none focus:border-brand" /></div> : null}
        {errorMessage ? <p role="alert" className="mt-4 text-sm text-danger-text">{errorMessage}</p> : null}
        {modalMode === "reply" && user.role === "ADMIN" && selected.moderationStatus === "PENDING" ? <ApproveAndReply formId="moderation-approval-response" externalSubmit type={queueType} id={selected.id} disabled={actionId !== null} reviewId={"reviewText" in selected ? selected.id : selected.reviewId} onBusy={busy => { if (busy) { setErrorMessage(""); setSuccessMessage(""); } actionLock.current = busy; setActionId(busy ? selected.id : null); }} onOriginalApproved={() => setReplyWorkflowId(selected.id)} onComplete={() => { removeModeratedItem(queueType, selected.id); setReplyWorkflowId(null); setPublishedTarget({ type: queueType, id: selected.id }); setSuccessMessage("Submission and response published successfully."); showApproved(queueType, selected.id); }} /> : null}
      </WorkspaceDialog> : null}

    </>
  );
}
