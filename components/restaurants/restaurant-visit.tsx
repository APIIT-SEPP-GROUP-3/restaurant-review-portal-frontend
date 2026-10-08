import type { ReactNode } from "react";
import type { RestaurantDetail } from "@/types/restaurant";

function VisitRow({ label, icon, children }: { label: string; icon: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-4 sm:gap-5">
      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white/50 text-xl text-stone-700">{icon}</span>
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-stone-500">{label}</dt>
        <dd className="mt-1.5 break-words text-base font-medium leading-7 text-zinc-800">{children}</dd>
      </div>
    </div>
  );
}

export function RestaurantVisit({ restaurant, directionsUrl }: { restaurant: RestaurantDetail; directionsUrl: string }) {
  const linkClass = "text-orange-700 underline decoration-orange-700/20 underline-offset-4 hover:decoration-orange-700";
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">Find us</p>
          <h2 id="visit-heading" className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Your next stop.</h2>
        </div>
        <a href={directionsUrl} target="_blank" rel="noreferrer" className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">Open directions ↗</a>
      </div>
      <dl className="mt-5 divide-y divide-stone-900/10 border-y border-stone-900/10">
        <VisitRow label="Address" icon="⌖">{restaurant.address}, {restaurant.city}</VisitRow>
        <VisitRow label="Opening hours" icon="◷"><span className="whitespace-pre-line">{restaurant.openingHours || "Contact the restaurant for opening hours."}</span></VisitRow>
        {restaurant.phone ? <VisitRow label="Phone" icon="↗"><a href={`tel:${restaurant.phone}`} className={linkClass}>{restaurant.phone}</a></VisitRow> : null}
        {restaurant.email ? <VisitRow label="Email" icon="@"><a href={`mailto:${restaurant.email}`} className={linkClass}>{restaurant.email}</a></VisitRow> : null}
        {restaurant.website ? <VisitRow label="Website" icon="◎"><a href={restaurant.website} target="_blank" rel="noreferrer" className={linkClass}>Visit website ↗</a></VisitRow> : null}
      </dl>
    </div>
  );
}
