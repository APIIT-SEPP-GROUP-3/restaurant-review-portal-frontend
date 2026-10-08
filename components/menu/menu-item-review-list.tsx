import type { MenuItemReview } from "@/types/review";

interface MenuItemReviewListProps {
  reviews: MenuItemReview[];
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatRating(value: number | string | null): string {
  if (value === null) {
    return "Not rated";
  }

  const rating = Number(value);
  return Number.isFinite(rating) ? `${rating.toFixed(1)}/5` : "Not rated";
}

export function MenuItemReviewList({ reviews }: MenuItemReviewListProps) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Customer feedback
          </p>
          <h2 className="mt-2 text-3xl font-bold text-zinc-950">
            Item reviews
          </h2>
        </div>
        <span className="text-sm text-zinc-500">{reviews.length} shown</span>
      </div>

      {reviews.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <h3 className="text-xl font-bold text-zinc-950">No reviews yet</h3>
          <p className="mt-2 text-zinc-600">
            Be the first customer to review this menu item.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-zinc-950">
                    {review.title ?? "Menu item experience"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    {review.user.firstName} {review.user.lastName} ·{" "}
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-600">
                  ★ {formatRating(review.overallRating)}
                </span>
              </div>

              <p className="mt-4 leading-7 text-zinc-700">
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
