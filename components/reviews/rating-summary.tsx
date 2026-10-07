import type { RestaurantRatingSummary } from "@/types/review";

export function RatingSummary({ summary }: { summary: RestaurantRatingSummary }) {
  const rating = summary.overallAverage;
  return (
    <section aria-label="Diner ratings" className="overflow-hidden rounded-3xl border border-white/15 bg-stone-900 p-6 text-white shadow-xl shadow-stone-900/10 sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200">The dining experience</p>
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <p className="text-6xl font-semibold tracking-tight">{rating === null ? "—" : rating.toFixed(1)}<span className="ml-2 text-lg font-normal text-zinc-300">/ 5</span></p>
        <div>
          <div aria-label={rating === null ? "No rating yet" : `${rating.toFixed(1)} out of 5 stars`} className="flex gap-1 text-xl">
            {[1, 2, 3, 4, 5].map(star => <span key={star} aria-hidden="true" className={rating !== null && star <= Math.round(rating) ? "text-orange-400" : "text-white/20"}>★</span>)}
          </div>
          <p className="mt-2 text-sm text-zinc-200">{summary.reviewCount ? `Based on ${summary.reviewCount} ${summary.reviewCount === 1 ? "diner review" : "diner reviews"}` : "Be the first to share your experience."}</p>
        </div>
      </div>
      {summary.ratingTypes.length ? <dl className="mt-7 grid gap-4 border-t sm:grid-cols-2 lg:grid-cols-3 border-white/10 pt-6">
        {summary.ratingTypes.map(item => (
          <div key={item.ratingTypeId}>
            <div className="mb-2 flex justify-between gap-3 text-sm"><dt className="text-zinc-200">{item.name}</dt><dd className="font-semibold">{item.average.toFixed(1)}</dd></div>
            <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-orange-400" style={{ width: `${Math.max(0, Math.min(100, item.average / 5 * 100))}%` }} /></div>
          </div>
        ))}
      </dl> : null}
    </section>
  );
}
