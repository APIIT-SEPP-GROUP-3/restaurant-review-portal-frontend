"use client";

import { useEffect, useState } from "react";
import { ReviewComments } from "@/components/reviews/review-comments";
import { getReviewComments } from "@/services/review-service";
import type { ReviewComment } from "@/types/review";

export function ReviewConversation({ reviewId, readOnly = false }: { reviewId: number; readOnly?: boolean }) {
  const [comments, setComments] = useState<ReviewComment[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    getReviewComments(reviewId).then(items => { if (active) setComments(items); })
      .catch(() => { if (active) setError("Unable to load the conversation. Reopen it to try again."); });
    return () => { active = false; };
  }, [reviewId]);
  if (error) return <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>;
  if (!comments) return <p role="status" className="mt-4 text-sm text-zinc-500">Loading conversation...</p>;
  return <ReviewComments reviewId={reviewId} comments={comments} readOnly={readOnly} initiallyOpen />;
}
