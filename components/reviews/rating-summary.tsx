import type { RestaurantRatingSummary } from "@/types/review";

interface RatingSummaryProps {
  summary: RestaurantRatingSummary;
}

function displayRating(value: number | null): string {
  return value === null ? "—" : value.toFixed(1);
}

export function RatingSummary({ summary }: RatingSummaryProps) {
  return (
    <section className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        Customer ratings
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <span className="text-5xl font-bold text-zinc-950">
          {displayRating(summary.overallAverage)}
        </span>
        <div className="pb-1">
          <p className="text-xl text-orange-500" aria-label="Maximum 5 stars">
            ★★★★★
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            {summary.reviewCount} {summary.reviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {summary.ratingTypes.length > 0 ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {summary.ratingTypes.map((rating) => (
            <div
              key={rating.ratingTypeId}
              className="flex items-center justify-between rounded-xl bg-orange-50 px-4 py-3"
            >
              <dt className="font-medium text-zinc-700">{rating.name}</dt>
              <dd className="font-bold text-orange-600">
                {rating.average.toFixed(1)}/5
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-6 text-sm text-zinc-500">
          No approved ratings are available yet.
        </p>
      )}
    </section>
  );
}
