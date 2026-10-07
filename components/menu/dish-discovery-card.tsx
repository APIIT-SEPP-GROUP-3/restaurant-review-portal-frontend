import Link from "next/link";

import type { PublicMenuItem } from "@/types/menu";

export function DishDiscoveryCard({ item }: { item: PublicMenuItem }) {
  const image = item.images.find(photo => photo.isPrimary) ?? item.images[0];

  return <article className="flex overflow-hidden rounded-2xl border border-panel-border bg-white shadow-sm">
    <Link href={`/menu-items/${item.id}`} aria-label={`View ${item.name}`} className="group relative w-28 shrink-0 overflow-hidden bg-brand-soft sm:w-40">
      {image ? (
        // Images are supplied dynamically by the backend.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.imageUrl} alt={image.altText ?? item.name} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      ) : <span className="flex h-full min-h-44 items-center justify-center text-4xl font-bold text-brand-ink">{item.name.charAt(0).toUpperCase()}</span>}
    </Link>
    <div className="min-w-0 flex-1 p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
        <span className="text-brand-ink">{item.menuCategory.name}</span>
        <span className={`rounded-full px-2 py-1 ${item.isAvailable ? "bg-success-soft text-success-text" : "bg-zinc-100 text-panel-muted"}`}>{item.isAvailable ? "Available" : "Unavailable"}</span>
      </div>
      <h2 className="mt-2 text-lg font-bold leading-snug text-panel-text"><Link href={`/menu-items/${item.id}`} className="hover:text-brand-ink">{item.name}</Link></h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-panel-muted">{item.description ?? "Discover more about this dish."}</p>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-lg font-bold text-panel-text">LKR {Number(item.price).toFixed(2)}</p><Link href={`/restaurants/${item.restaurant.id}`} className="mt-1 block text-xs text-panel-muted hover:text-brand-ink">{item.restaurant.name} · {item.restaurant.city}</Link></div>
        <Link href={`/menu-items/${item.id}`} className="text-sm font-semibold text-brand-ink hover:underline">View dish →</Link>
      </div>
    </div>
  </article>;
}
