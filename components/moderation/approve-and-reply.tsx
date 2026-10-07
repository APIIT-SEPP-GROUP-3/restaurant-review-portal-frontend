"use client";

import { useRef, useState, type FormEvent } from "react";
import { ApiError, apiRequest } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { approveComment, approveReview } from "@/services/moderation-service";
import { createReviewComment } from "@/services/review-service";

interface ApproveAndReplyProps {
  type: "reviews" | "comments";
  id: number;
  reviewId: number;
  disabled?: boolean;
  formId?: string;
  externalSubmit?: boolean;
  onBusy: (busy: boolean) => void;
  onOriginalApproved: () => void;
  onComplete: () => void;
}

export function ApproveAndReply({ type, id, reviewId, disabled = false, formId, externalSubmit = false, onBusy, onOriginalApproved, onComplete }: ApproveAndReplyProps) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [replySaved, setReplySaved] = useState(false);
  const [originalApproved, setOriginalApproved] = useState(false);
  const approved = useRef(false);
  const replyId = useRef<number | null>(null);
  const running = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (running.current || disabled) return;
    const token = getAuthToken();
    if (!token) { setError("Your session has expired. Please log in again."); return; }
    if (text.trim().length < 2) { setError("Enter a response of at least 2 characters."); return; }
    running.current = true;
    onBusy(true);
    setError("");
    try {
      if (!approved.current) {
        if (type === "comments") {
          setStage("Checking the parent review...");
          // Public review access succeeds only when the parent review is approved.
          try { await apiRequest(`/reviews/${reviewId}`, { token, cache: "no-store" }); }
          catch (requestError) {
            if (requestError instanceof ApiError && [400, 404].includes(requestError.status)) {
              throw new ApiError("Approve the parent review before approving and replying to this comment.", requestError.status);
            }
            throw requestError;
          }
        }
        setStage("Approving submission...");
        if (type === "reviews") await approveReview(id, token);
        else await approveComment(id, token);
        approved.current = true;
        setOriginalApproved(true);
        onOriginalApproved();
      }
      if (replyId.current === null) {
        setStage("Saving your response...");
        const response = await createReviewComment(reviewId, {
          commentText: text.trim(),
          ...(type === "comments" ? { parentCommentId: id } : {}),
        }, token);
        replyId.current = response.id;
        setReplySaved(true);
      }
      setStage("Publishing your response...");
      await approveComment(replyId.current, token);
      onComplete();
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Unable to finish. Please try again.";
      setError(replyId.current !== null
        ? `The submission is approved and your response is saved, but publishing failed. Retry to publish the same response. ${message}`
        : approved.current
          ? `The submission is approved, but your response was not saved. Retry to finish. ${message}`
          : message);
    } finally {
      running.current = false;
      onBusy(false);
      setStage("");
    }
  }

  return <form id={formId} onSubmit={submit} className="mt-5 space-y-3 rounded-2xl border border-orange-200 bg-orange-50/60 p-4" aria-busy={Boolean(stage)}>
    <label htmlFor={`approval-reply-${type}-${id}`} className="block text-sm font-semibold text-zinc-900">Approve with a response</label>
    <p className="text-xs leading-5 text-zinc-500">Approves the submission, then saves and publishes your response.</p>
    <textarea id={`approval-reply-${type}-${id}`} required minLength={2} maxLength={2000} rows={3} value={text} disabled={disabled || Boolean(stage) || replySaved} onChange={event => setText(event.target.value)} placeholder="Write your response to the customer" className="w-full rounded-xl border border-orange-200 bg-white p-3 text-sm text-zinc-950 outline-none focus:border-orange-500" />
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
    {!externalSubmit ? <button disabled={disabled || Boolean(stage)} className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50">{stage || (originalApproved ? "Retry response" : "Approve and reply")}</button> : null}
    {stage ? <p role="status" className="text-sm text-zinc-600">{stage}</p> : null}
  </form>;
}
