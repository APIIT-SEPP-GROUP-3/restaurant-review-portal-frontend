import Link from "next/link";

import type { RestaurantSummary } from "@/types/restaurant";

interface RestaurantCardProps {
  restaurant: RestaurantSummary;
}

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const primaryImage = restaurant.images.find((image) => image.isPrimary);
  const categories = restaurant.categories.slice(0, 3);

  return (
    <article className="group overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
        {primaryImage ? (
          // Restaurant image URLs come from the backend and can use different hosts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={primaryImage.imageUrl}
            alt={primaryImage.altText ?? `${restaurant.name} restaurant`}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-bold text-white">
              {restaurant.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-zinc-700 shadow-sm">
          {restaurant.city}
        </span>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap gap-2">
          {categories.map(({ category }) => (
            <span
              key={category.id}
              className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700"
            >
              {category.name}
            </span>
          ))}
        </div>

        <h2 className="mt-4 text-xl font-bold text-zinc-950">
          {restaurant.name}
        </h2>

        <p className="mt-2 text-sm text-zinc-500">
          {restaurant.address}, {restaurant.city}
        </p>

        <p className="mt-3 min-h-12 text-sm leading-6 text-zinc-600">
          {restaurant.description ??
            "Discover the menu and dining experience at this restaurant."}
        </p>

        <Link
          href={`/restaurants/${restaurant.id}`}
          className="mt-5 inline-flex items-center font-semibold text-orange-600 transition-colors hover:text-orange-700"
        >
          View restaurant
          <span aria-hidden="true" className="ml-2">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}