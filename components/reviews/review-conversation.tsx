"use client";

import { ConversationSkeleton } from "@/components/ui/loading-layouts";
import { useEffect, useState } from "react";
import { ReviewComments } from "@/components/reviews/review-comments";
import { getReviewComments } from "@/services/review-service";
import type { ReviewComment } from "@/types/review";

export function ReviewConversation({ reviewId, allowOwner = false, readOnly = false, onBusy, focusComposer = false }: { reviewId: number; allowOwner?: boolean; readOnly?: boolean; onBusy?: (busy: boolean) => void; focusComposer?: boolean }) {
  const [comments, setComments] = useState<ReviewComment[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getReviewComments(reviewId).then(items => { if (active) setComments(items); })
      .catch(() => { if (active) setError("Unable to load the conversation. Reopen it to try again."); });
    return () => { active = false; };
  }, [reviewId]);
  if (error) return <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>;
  if (!comments) return <ConversationSkeleton />;
  return <ReviewComments allowOwner={allowOwner} reviewId={reviewId} comments={comments} readOnly={readOnly} onBusy={onBusy} focusComposer={focusComposer} initiallyOpen />;
}
