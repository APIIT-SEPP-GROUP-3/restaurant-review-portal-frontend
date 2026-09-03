import {
  ApiError,
  apiRequest,
  apiRequestEnvelope,
} from "@/lib/api-client";

import type {
  RestaurantCategory,
  RestaurantDetail,
  RestaurantSearchParams,
  RestaurantSearchResult,
  RestaurantSummary,
} from "@/types/restaurant";

export async function getRestaurants(
  filters: RestaurantSearchParams = {},
): Promise<RestaurantSearchResult> {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set("search", filters.search);
  }

  if (filters.city) {
    query.set("city", filters.city);
  }

  if (filters.categoryId !== undefined) {
    query.set("categoryId", String(filters.categoryId));
  }

  if (filters.page !== undefined) {
    query.set("page", String(filters.page));
  }

  if (filters.limit !== undefined) {
    query.set("limit", String(filters.limit));
  }

  if (filters.sortBy) {
    query.set("sortBy", filters.sortBy);
  }

  if (filters.sortOrder) {
    query.set("sortOrder", filters.sortOrder);
  }

  const queryString = query.toString();
  const path = queryString ? `/restaurants?${queryString}` : "/restaurants";

  const response =
    await apiRequestEnvelope<RestaurantSummary[]>(path);

  if (!response.pagination) {
    throw new ApiError(
      "The server did not return pagination information.",
      500,
    );
  }

  return {
    restaurants: response.data,
    pagination: response.pagination,
  };
}

export function getRestaurantCategories(): Promise<RestaurantCategory[]> {
  return apiRequest<RestaurantCategory[]>("/restaurant-categories");
}

export function getRestaurantById(
  restaurantId: number,
): Promise<RestaurantDetail> {
  return apiRequest<RestaurantDetail>(`/restaurants/${restaurantId}`);
}
