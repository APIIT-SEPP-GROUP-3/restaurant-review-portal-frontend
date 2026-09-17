import Link from "next/link";

import type { RestaurantSummary } from "@/types/restaurant";

interface HeroSectionProps {
  featuredRestaurant?: RestaurantSummary;
  restaurantCount: number;
  menuItemCount: number;
}

export function HeroSection({
  featuredRestaurant,
  restaurantCount,
  menuItemCount,
}: HeroSectionProps) {
  const primaryImage =
    featuredRestaurant?.images.find((image) => image.isPrimary) ??
    featuredRestaurant?.images[0];

  return (
    <section className="relative overflow-hidden bg-[#fffaf5]">
      <div
        aria-hidden="true"
        className="absolute -left-24 top-20 size-72 rounded-full bg-orange-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -right-24 bottom-0 size-80 rounded-full bg-amber-200/50 blur-3xl"
      />

      <div className="relative mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
            Discover your next favourite restaurant
          </span>
          <h1 className="mt-6 max-w-2xl text-5xl leading-[1.05] font-bold tracking-[-0.04em] text-zinc-950 sm:text-6xl">
            Great meals begin with{" "}
            <span className="text-orange-500">honest reviews.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600">
            Explore local restaurants, compare their menus, read genuine
            customer experiences, and share your own dining stories.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/restaurants"
              className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
            >
              Explore restaurants
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center rounded-full border border-zinc-300 bg-white px-6 py-3.5 text-sm font-semibold text-zinc-800 transition-colors hover:border-orange-300 hover:bg-orange-50"
            >
              Browse menus
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-600">
            <p>
              <strong className="text-zinc-950">{restaurantCount}</strong>{" "}
              {restaurantCount === 1 ? "restaurant" : "restaurants"} available
            </p>
            <p>
              <strong className="text-zinc-950">{menuItemCount}</strong>{" "}
              {menuItemCount === 1 ? "menu item" : "menu items"} to discover
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="rounded-[2rem] bg-gradient-to-br from-orange-500 to-amber-400 p-6 shadow-2xl shadow-orange-200 sm:p-8">
            {featuredRestaurant ? (
              <div className="overflow-hidden rounded-3xl bg-white shadow-lg">
                <div className="h-60 bg-gradient-to-br from-zinc-800 to-orange-900">
                  {primaryImage ? (
                    // Images are supplied dynamically by the backend.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primaryImage.imageUrl}
                      alt={primaryImage.altText ?? featuredRestaurant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-7xl font-bold text-white">
                      {featuredRestaurant.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm font-medium text-orange-500">
                    Recently added restaurant
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-zinc-950">
                    {featuredRestaurant.name}
                  </h2>
                  <p className="mt-1 text-sm text-zinc-500">
                    {featuredRestaurant.city}
                  </p>
                  <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-600">
                    {featuredRestaurant.description ??
                      "Explore this restaurant and discover its dining options."}
                  </p>
                  <Link
                    href={`/restaurants/${featuredRestaurant.id}`}
                    className="mt-5 inline-flex font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View restaurant →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
                <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-orange-100 text-3xl font-bold text-orange-600">
                  D
                </span>
                <h2 className="mt-6 text-2xl font-bold text-zinc-950">
                  Restaurant discovery starts here
                </h2>
                <p className="mt-3 leading-7 text-zinc-600">
                  New restaurants will appear here as soon as they are added.
                </p>
                <Link
                  href="/restaurants"
                  className="mt-6 inline-flex rounded-full bg-orange-500 px-5 py-3 font-semibold text-white hover:bg-orange-600"
                >
                  Browse restaurants
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
