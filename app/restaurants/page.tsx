import type { Metadata } from "next";

import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { RestaurantFilters } from "@/components/restaurants/restaurant-filters";
import { RestaurantPagination } from "@/components/restaurants/restaurant-pagination";
import { ApiError } from "@/lib/api-client";
import {
  getRestaurantCategories,
  getRestaurants,
} from "@/services/restaurant-service";
import type { Pagination } from "@/types/api";
import type {
  RestaurantCategory,
  RestaurantSearchParams,
  RestaurantSortField,
  RestaurantSummary,
  SortOrder,
} from "@/types/restaurant";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Search and discover restaurants with DineRate.",
};

type SearchParamValue = string | string[] | undefined;

interface RestaurantsPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function getSingleValue(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getPositiveInteger(
  value: SearchParamValue,
  fallback: number,
): number {
  const parsedValue = Number(getSingleValue(value));

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
}

function getOptionalPositiveInteger(
  value: SearchParamValue,
): number | undefined {
  const parsedValue = Number(getSingleValue(value));

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
}

function getSortField(value: SearchParamValue): RestaurantSortField {
  const sortBy = getSingleValue(value);

  if (
    sortBy === "name" ||
    sortBy === "city" ||
    sortBy === "createdAt"
  ) {
    return sortBy;
  }

  return "name";
}

function getSortOrder(value: SearchParamValue): SortOrder {
  return getSingleValue(value) === "desc" ? "desc" : "asc";
}

export default async function RestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const query = await searchParams;

  const search = getSingleValue(query.search)?.trim() || undefined;
  const city = getSingleValue(query.city)?.trim() || undefined;

  const filters: RestaurantSearchParams = {
    search,
    city,
    categoryId: getOptionalPositiveInteger(query.categoryId),
    page: getPositiveInteger(query.page, 1),
    limit: 9,
    sortBy: getSortField(query.sortBy),
    sortOrder: getSortOrder(query.sortOrder),
  };

  let restaurants: RestaurantSummary[] = [];
  let categories: RestaurantCategory[] = [];
  let errorMessage = "";

  let pagination: Pagination = {
    page: filters.page ?? 1,
    limit: filters.limit ?? 9,
    total: 0,
    totalPages: 0,
  };

  try {
    const [restaurantResult, categoryResult] = await Promise.all([
      getRestaurants(filters),
      getRestaurantCategories(),
    ]);

    restaurants = restaurantResult.restaurants;
    pagination = restaurantResult.pagination;
    categories = categoryResult;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? error.message
        : "Unable to load restaurants. Please try again.";
  }

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Restaurant discovery
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            Find your next favourite restaurant
          </h1>

          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Search by restaurant name, food, city, or category and discover
            dining experiences that suit you.
          </p>
        </div>

        <div className="mt-8">
          <RestaurantFilters categories={categories} filters={filters} />
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700"
          >
            {errorMessage}
          </div>
        ) : (
          <>
            <div className="mt-10 flex items-center justify-between">
              <p className="text-sm text-zinc-600">
                <strong className="text-zinc-950">{pagination.total}</strong>{" "}
                {pagination.total === 1 ? "restaurant" : "restaurants"} found
              </p>
            </div>

            {restaurants.length > 0 ? (
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {restaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-bold text-zinc-950">
                  No restaurants found
                </h2>

                <p className="mt-2 text-zinc-600">
                  Try changing or clearing your search filters.
                </p>
              </div>
            )}

            <RestaurantPagination
              pagination={pagination}
              filters={filters}
            />
          </>
        )}
      </div>
    </section>
  );
}