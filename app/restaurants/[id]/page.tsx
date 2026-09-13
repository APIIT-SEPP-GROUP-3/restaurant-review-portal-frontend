import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import { getRestaurantById } from "@/services/restaurant-service";
import type { RestaurantDetail } from "@/types/restaurant";

export const metadata: Metadata = {
  title: "Restaurant details",
  description: "View restaurant information on DineRate.",
};

interface RestaurantDetailPageProps {
  params: Promise<{ id: string }>;
}

interface RestaurantLoadResult {
  restaurant: RestaurantDetail | null;
  errorMessage: string;
  isNotFound: boolean;
}

async function loadRestaurant(
  restaurantId: number,
): Promise<RestaurantLoadResult> {
  try {
    return {
      restaurant: await getRestaurantById(restaurantId),
      errorMessage: "",
      isNotFound: false,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return {
        restaurant: null,
        errorMessage: "",
        isNotFound: true,
      };
    }

    return {
      restaurant: null,
      errorMessage:
        error instanceof ApiError
          ? error.message
          : "Unable to load this restaurant.",
      isNotFound: false,
    };
  }
}

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { id } = await params;
  const restaurantId = Number(id);

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    notFound();
  }

  const { restaurant, errorMessage, isNotFound } =
    await loadRestaurant(restaurantId);

  if (isNotFound) {
    notFound();
  }

  if (!restaurant) {
    return (
      <section className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-2xl font-bold text-zinc-950">
            Restaurant unavailable
          </h1>
          <p className="mt-3 text-red-700">{errorMessage}</p>
          <Link
            href="/restaurants"
            className="mt-6 inline-flex font-semibold text-orange-600"
          >
            Return to restaurants
          </Link>
        </div>
      </section>
    );
  }

  const primaryImage =
    restaurant.images.find((image) => image.isPrimary) ??
    restaurant.images[0];

  return (
      <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/restaurants"
            className="inline-flex font-semibold text-orange-600 hover:text-orange-700"
          >
            ← Back to restaurants
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="min-h-80 bg-gradient-to-br from-orange-100 to-amber-100">
                {primaryImage ? (
                  // Images are supplied dynamically by the backend.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={primaryImage.imageUrl}
                    alt={
                      primaryImage.altText ??
                      `${restaurant.name} restaurant`
                    }
                    className="h-full min-h-80 w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-80 items-center justify-center">
                    <span className="flex size-24 items-center justify-center rounded-3xl bg-orange-500 text-4xl font-bold text-white">
                      {restaurant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-7 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                  {restaurant.city}
                </p>

                <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950">
                  {restaurant.name}
                </h1>

                <p className="mt-5 leading-7 text-zinc-600">
                  {restaurant.description ??
                    "Restaurant information and dining details."}
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  {restaurant.categories.map(({ category }) => (
                    <span
                      key={category.id}
                      className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>

                <dl className="mt-8 space-y-4 text-sm">
                  <div>
                    <dt className="font-semibold text-zinc-950">Address</dt>
                    <dd className="mt-1 text-zinc-600">
                      {restaurant.address}, {restaurant.city}
                    </dd>
                  </div>

                  {restaurant.openingHours ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">
                        Opening hours
                      </dt>
                      <dd className="mt-1 text-zinc-600">
                        {restaurant.openingHours}
                      </dd>
                    </div>
                  ) : null}

                  {restaurant.phone ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">Phone</dt>
                      <dd className="mt-1">
                        <a
                          href={`tel:${restaurant.phone}`}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          {restaurant.phone}
                        </a>
                      </dd>
                    </div>
                  ) : null}

                  {restaurant.website ? (
                    <div>
                      <dt className="font-semibold text-zinc-950">Website</dt>
                      <dd className="mt-1">
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-orange-600 hover:text-orange-700"
                        >
                          Visit website
                        </a>
                      </dd>
                    </div>
                  ) : null}
                </dl>

                <p className="mt-8 text-xs text-zinc-500">
                  Managed by {restaurant.owner.firstName}{" "}
                  {restaurant.owner.lastName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}
