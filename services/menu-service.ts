import {
  ApiError,
  apiRequest,
  apiRequestEnvelope,
} from "@/lib/api-client";
import type {
  MenuItemSearchParams,
  MenuItemSearchResult,
  PublicMenuItem,
} from "@/types/menu";
import type { ManagedMenuItem } from "@/types/restaurant";

export async function getPublicMenuItems(
  filters: MenuItemSearchParams = {},
): Promise<MenuItemSearchResult> {
  const query = new URLSearchParams();

  if (filters.search) {
    query.set("search", filters.search);
  }
  if (filters.restaurantId !== undefined) {
    query.set("restaurantId", String(filters.restaurantId));
  }
  if (filters.menuCategoryId !== undefined) {
    query.set("menuCategoryId", String(filters.menuCategoryId));
  }
  if (filters.isAvailable !== undefined) {
    query.set("isAvailable", String(filters.isAvailable));
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
  const response = await apiRequestEnvelope<PublicMenuItem[]>(
    queryString ? `/menu-items?${queryString}` : "/menu-items",
  );

  if (!response.pagination) {
    throw new ApiError(
      "The server did not return pagination information.",
      500,
    );
  }

  return {
    menuItems: response.data,
    pagination: response.pagination,
  };
}

export function getMenuItemById(
  menuItemId: number,
): Promise<PublicMenuItem> {
  return apiRequest<PublicMenuItem>(`/menu-items/${menuItemId}`);
}

export function getRestaurantMenuItems(
  restaurantId: number,
): Promise<ManagedMenuItem[]> {
  return apiRequest<ManagedMenuItem[]>(
    `/restaurants/${restaurantId}/menu-items`,
  );
}
