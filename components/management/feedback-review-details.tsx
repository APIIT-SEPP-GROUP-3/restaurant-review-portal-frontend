import { formatDate } from "@/lib/format-date";
import { formatRating } from "@/lib/format-rating";
import type { RestaurantReview } from "@/types/review";

export function FeedbackReviewDetails({ review }: { review: RestaurantReview }) {
  return <article>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="font-semibold">{review.user.firstName} {review.user.lastName}</p>
        <time dateTime={review.createdAt} className="mt-1 block text-xs text-panel-muted">{formatDate(review.createdAt)}</time>
      </div>
      <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-hover">★ {formatRating(review.overallRating)}</span>
    </div>
    <h3 className="mt-5 text-lg font-bold">{review.title || "Dining experience"}</h3>
    <p className="mt-3 whitespace-pre-line text-sm leading-7">{review.reviewText}</p>
    {review.menuItem ? <p className="mt-3 text-sm text-panel-muted">Menu item: {review.menuItem.name}</p> : null}
    {review.ratings.length ? <dl className="mt-5 grid gap-2 sm:grid-cols-2">
      {review.ratings.map(rating => <div key={rating.id} className="flex items-center justify-between gap-3 rounded-xl bg-panel-subtle px-3 py-2 text-sm">
        <dt className="text-panel-muted">{rating.ratingType.name}</dt><dd className="font-semibold">{rating.ratingValue}/5</dd>
      </div>)}
    </dl> : null}
  </article>;
}
