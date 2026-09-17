import Link from "next/link";

import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import type { RestaurantSummary } from "@/types/restaurant";

interface FeaturedRestaurantsProps {
  restaurants: RestaurantSummary[];
  errorMessage?: string;
}

export function FeaturedRestaurants({
  restaurants,
  errorMessage,
}: FeaturedRestaurantsProps) {
  return (
    <section id="featured" className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Restaurant discovery
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Recently added restaurants
            </h2>
            <p className="mt-3 text-zinc-600">
              Explore the latest active restaurants available in the DineRate community.
            </p>
          </div>
          <Link
            href="/restaurants"
            className="rounded-full border border-orange-200 px-5 py-2.5 font-semibold text-orange-600 hover:bg-orange-50"
          >
            View all restaurants
          </Link>
        </div>

        {errorMessage ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            {errorMessage}
          </p>
        ) : restaurants.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
            <h3 className="text-xl font-bold text-zinc-950">No restaurants yet</h3>
            <p className="mt-2 text-zinc-600">
              Active restaurants will be displayed here when they become available.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
