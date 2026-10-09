"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import { createReviewComment } from "@/services/review-service";
import type {
  ReviewComment,
  ReviewCommentAuthor,
  ReviewCommentReply,
} from "@/types/review";

interface ReviewCommentsProps {
  reviewAuthorId?: number;
  allowOwner?: boolean;
  reviewId: number;
  comments: ReviewComment[];
  initiallyOpen?: boolean;
  readOnly?: boolean;
  onBusy?: (busy: boolean) => void;
  focusComposer?: boolean;
}

interface CommentAuthorLabelProps {
  author: ReviewCommentAuthor;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function CommentAuthorLabel({ author }: CommentAuthorLabelProps) {
  const roleLabel =
    author.role.roleName === "RESTAURANT_OWNER"
      ? "Restaurant owner"
      : author.role.roleName === "ADMIN"
        ? "Admin"
        : null;

  return (
    <p className="text-sm font-semibold text-zinc-900">
      {author.firstName} {author.lastName}
      {roleLabel ? (
        <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">
          {roleLabel}
        </span>
      ) : null}
    </p>
  );
}

function CommentReply({ reply }: { reply: ReviewCommentReply }) {
  return (
    <div className="mt-3 rounded-xl border-l-4 border-orange-200 bg-white px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CommentAuthorLabel author={reply.user} />
        <time className="text-xs text-zinc-500" dateTime={reply.createdAt}>
          {formatDate(reply.createdAt)}
        </time>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-700">
        {reply.commentText}
      </p>
    </div>
  );
}

export function ReviewComments({ reviewAuthorId, allowOwner = false, reviewId, comments, initiallyOpen = false, readOnly = false, onBusy, focusComposer = false }: ReviewCommentsProps) {
  const user = useAuthUser();
  const submitting = useRef(false);

  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canComment = !readOnly && (
    (user?.role === "CUSTOMER" && user.id !== reviewAuthorId) ||
    (user?.role === "RESTAURANT_OWNER" && allowOwner)
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !canComment) return;
    setErrorMessage("");
    setSuccessMessage("");

    const token = getAuthToken();
    if (!token) {
      setErrorMessage("Please log in before adding a comment.");
      return;
    }

    if (commentText.trim().length < 2) {
      setErrorMessage("Enter at least 2 characters.");
      return;
    }
    submitting.current = true;
    setIsSubmitting(true);
    onBusy?.(true);

    try {
      await createReviewComment(
        reviewId,
        {
          commentText: commentText.trim(),
          parentCommentId: replyingTo ?? undefined,
        },
        token,
      );

      setCommentText("");
      setReplyingTo(null);
      setSuccessMessage(
        "Thanks! Your comment will appear after a quick check.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError
          ? error.message
          : "Unable to submit your comment. Please try again.",
      );
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
      onBusy?.(false);
    }
  }

  return (
    <details open={initiallyOpen} className="mt-5 border-t border-slate-200/70 pt-4">
      <summary className="w-fit cursor-pointer text-sm font-semibold text-zinc-600 hover:text-orange-600">
        {comments.length ? `Conversation (${comments.length})` : "Start a conversation"}
      </summary>

      {comments.length > 0 ? (
        <div className="mt-3 space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-zinc-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CommentAuthorLabel author={comment.user} />
                <time className="text-xs text-zinc-500" dateTime={comment.createdAt}>
                  {formatDate(comment.createdAt)}
                </time>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-700">
                {comment.commentText}
              </p>

              {canComment ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setCommentText("");
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className="mt-2 text-xs font-semibold text-orange-600 hover:text-orange-700"
                >
                  Reply
                </button>
              ) : null}

              {comment.replies.map((reply) => (
                <CommentReply key={reply.id} reply={reply} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        null
      )}

      {readOnly ? null : !user ? (
        <p className="mt-4 text-sm text-zinc-600">
          <Link href="/login" className="font-semibold text-orange-600">
            Log in
          </Link>{" "}
          to join the conversation.
        </p>
      ) : canComment ? (
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {replyingTo ? (
            <div className="flex items-center justify-between rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
              <span>Writing a reply</span>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setReplyingTo(null);
                  setCommentText("");
                }}
                className="font-semibold"
              >
                Cancel
              </button>
            </div>
          ) : null}

          {errorMessage ? (
            <p role="alert" className="text-sm text-red-700">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p role="status" className="text-sm text-green-700">
              {successMessage}
            </p>
          ) : null}

          <label htmlFor={`comment-${reviewId}`} className="sr-only">
            {replyingTo ? "Write a reply" : "Write a comment"}
          </label>
          <textarea
            id={`comment-${reviewId}`}
            required
            autoFocus={focusComposer}
            disabled={isSubmitting}
            minLength={2}
            maxLength={2000}
            rows={3}
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
            placeholder={replyingTo ? "Write your reply" : "Add a comment"}
            className="w-full resize-y rounded-xl border border-zinc-300 bg-white/70 px-4 py-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Submitting..."
              : replyingTo
                ? "Submit reply"
                : "Submit comment"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-zinc-500">
          Your account role cannot add comments.
        </p>
      )}
    </details>
  );
}
