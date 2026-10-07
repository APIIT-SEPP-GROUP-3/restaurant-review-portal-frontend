"use client";

import { useEffect, useState } from "react";
import { ReviewList } from "@/components/reviews/review-list";
import { getRestaurantReviews, getReviewComments } from "@/services/review-service";
import type { RestaurantReview, ReviewComment } from "@/types/review";

export function CustomerFeedback({ restaurantId }: { restaurantId: number }) {
  const [data, setData] = useState<{ reviews: RestaurantReview[]; comments: Record<number, ReviewComment[]> } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const reviews = await getRestaurantReviews(restaurantId);
        const entries = await Promise.all(reviews.map(async review => [review.id, await getReviewComments(review.id)] as const));
        if (active) setData({ reviews, comments: Object.fromEntries(entries) });
      } catch { if (active) setError("Unable to load customer feedback. Reopen this section to try again."); }
    }
    void load();
    return () => { active = false; };
  }, [restaurantId]);
  return <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8">
    <h2 className="text-2xl font-bold text-zinc-950">Customer feedback</h2>
    <p className="mb-6 mt-2 text-sm text-zinc-600">Open a conversation to respond to a review or reply to a customer comment. Responses appear publicly after review by the moderation team.</p>
    {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : data ? <ReviewList reviews={data.reviews} commentsByReviewId={data.comments} /> : <p role="status" className="text-sm text-zinc-500">Loading feedback...</p>}
  </section>;
}
