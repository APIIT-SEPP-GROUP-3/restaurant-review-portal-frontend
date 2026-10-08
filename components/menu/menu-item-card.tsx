import Link from "next/link";

import type { PublicMenuItem } from "@/types/menu";

interface MenuItemCardProps {
  item: PublicMenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const primaryImage =
    item.images.find((image) => image.isPrimary) ?? item.images[0];

  return (
    <article className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="h-52 bg-gradient-to-br from-orange-100 to-amber-100">
        {primaryImage ? (
          // Images are supplied dynamically by the backend.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText ?? item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex size-20 items-center justify-center rounded-3xl bg-orange-500 text-3xl font-bold text-white">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              {item.menuCategory.name}
            </p>
            <h2 className="mt-2 text-xl font-bold text-zinc-950">
              {item.name}
            </h2>
          </div>
          <span className="whitespace-nowrap text-lg font-bold text-zinc-950">
            LKR {Number(item.price).toFixed(2)}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-600">
          {item.description ?? "Menu item details are available at the restaurant."}
        </p>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-zinc-100 pt-4">
          <div>
            <p className="text-sm font-semibold text-zinc-900">
              {item.restaurant.name}
            </p>
            <p className="text-xs text-zinc-500">{item.restaurant.city}</p>
          </div>
          <Link
            href={`/menu-items/${item.id}`}
            className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
          >
            View item
          </Link>
        </div>
      </div>
    </article>
  );
}
