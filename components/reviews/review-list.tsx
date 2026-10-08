import { formatRating } from "@/lib/format-rating";
import type { RestaurantReview } from "@/types/review";
import type { ReviewComment } from "@/types/review";

import { ReviewComments } from "@/components/reviews/review-comments";

interface ReviewListProps {
  reviews: RestaurantReview[];
  commentsByReviewId: Record<number, ReviewComment[]>;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}


export function ReviewList({
  reviews,
  commentsByReviewId,
}: ReviewListProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            From the community
          </p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-950">
            What diners are saying
          </h2>
        </div>
        <span className="text-sm text-zinc-500">{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <h3 className="text-xl font-bold text-zinc-950">No reviews yet</h3>
          <p className="mt-2 text-zinc-600">
            Be the first customer to share a dining experience.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-3xl border border-white/80 bg-white/65 p-6 shadow-sm shadow-stone-200/30 backdrop-blur sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-stone-900 text-sm font-semibold text-white">{review.user.firstName.charAt(0)}{review.user.lastName.charAt(0)}</span>
                  <div>
                  <h3 className="text-lg font-bold text-zinc-950">
                    {review.user.firstName} {review.user.lastName}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatDate(review.createdAt)}
                  </p>
                  </div>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                  ★ {formatRating(review.overallRating)}
                </span>
              </div>

              {review.title ? <h4 className="mt-5 text-lg font-semibold text-zinc-950">{review.title}</h4> : null}
              <p className="mt-3 leading-7 text-zinc-700">
                {review.reviewText}
              </p>

              {review.ratings.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {review.ratings.map((rating) => (
                    <span
                      key={rating.id}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                    >
                      {rating.ratingType.name}: {rating.ratingValue}/5
                    </span>
                  ))}
                </div>
              ) : null}

              {review.menuItem ? (
                <p className="mt-4 text-xs font-medium text-zinc-500">
                  Menu item: {review.menuItem.name}
                </p>
              ) : null}

              <ReviewComments
                reviewId={review.id}
                comments={commentsByReviewId[review.id] ?? []}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
