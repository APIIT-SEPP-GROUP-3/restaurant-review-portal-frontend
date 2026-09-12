import { apiRequest } from "@/lib/api-client";
import type {
  CreateImageInput,
  CreateMenuCategoryInput,
  CreateMenuItemInput,
  CreateRestaurantCategoryInput,
  CreateRestaurantInput,
  ManagedMenuItem,
  MenuCategory,
  MenuItem,
  MenuItemImage,
  RestaurantCategory,
  RestaurantImage,
  RestaurantRecord,
  RestaurantWithCategories,
  UpdateMenuCategoryInput,
  UpdateMenuItemInput,
  UpdateRestaurantInput,
} from "@/types/restaurant";

export function createRestaurant(
  input: CreateRestaurantInput,
  token: string,
): Promise<RestaurantRecord> {
  return apiRequest<RestaurantRecord>("/restaurants", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function updateRestaurant(
  restaurantId: number,
  input: UpdateRestaurantInput,
  token: string,
): Promise<RestaurantRecord> {
  return apiRequest<RestaurantRecord>(`/restaurants/${restaurantId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function updateRestaurantCategories(
  restaurantId: number,
  categoryIds: number[],
  token: string,
): Promise<RestaurantWithCategories> {
  return apiRequest<RestaurantWithCategories>(
    `/restaurants/${restaurantId}/categories`,
    {
      method: "PUT",
      token,
      body: JSON.stringify({ categoryIds }),
    },
  );
}

export function createRestaurantCategory(
  input: CreateRestaurantCategoryInput,
  token: string,
): Promise<RestaurantCategory> {
  return apiRequest<RestaurantCategory>("/restaurant-categories", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function getMenuCategories(
  restaurantId: number,
): Promise<MenuCategory[]> {
  return apiRequest<MenuCategory[]>(
    `/restaurants/${restaurantId}/menu-categories`,
  );
}

export function createMenuCategory(
  restaurantId: number,
  input: CreateMenuCategoryInput,
  token: string,
): Promise<MenuCategory> {
  return apiRequest<MenuCategory>(
    `/restaurants/${restaurantId}/menu-categories`,
    {
      method: "POST",
      token,
      body: JSON.stringify(input),
    },
  );
}

export function updateMenuCategory(
  menuCategoryId: number,
  input: UpdateMenuCategoryInput,
  token: string,
): Promise<MenuCategory> {
  return apiRequest<MenuCategory>(`/menu-categories/${menuCategoryId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function getMenuItems(
  restaurantId: number,
): Promise<ManagedMenuItem[]> {
  return apiRequest<ManagedMenuItem[]>(
    `/restaurants/${restaurantId}/menu-items`,
  );
}

export function createMenuItem(
  restaurantId: number,
  input: CreateMenuItemInput,
  token: string,
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/restaurants/${restaurantId}/menu-items`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function updateMenuItem(
  menuItemId: number,
  input: UpdateMenuItemInput,
  token: string,
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${menuItemId}`, {
    method: "PUT",
    token,
    body: JSON.stringify(input),
  });
}

export function updateMenuItemAvailability(
  menuItemId: number,
  isAvailable: boolean,
  token: string,
): Promise<MenuItem> {
  return apiRequest<MenuItem>(`/menu-items/${menuItemId}/availability`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ isAvailable }),
  });
}

export function addRestaurantImage(
  restaurantId: number,
  input: CreateImageInput,
  token: string,
): Promise<RestaurantImage> {
  return apiRequest<RestaurantImage>(`/restaurants/${restaurantId}/images`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function deleteRestaurantImage(
  restaurantId: number,
  imageId: number,
  token: string,
): Promise<RestaurantImage> {
  return apiRequest<RestaurantImage>(
    `/restaurants/${restaurantId}/images/${imageId}`,
    { method: "DELETE", token },
  );
}

export function addMenuItemImage(
  menuItemId: number,
  input: CreateImageInput,
  token: string,
): Promise<MenuItemImage> {
  return apiRequest<MenuItemImage>(`/menu-items/${menuItemId}/images`, {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function deleteMenuItemImage(
  menuItemId: number,
  imageId: number,
  token: string,
): Promise<MenuItemImage> {
  return apiRequest<MenuItemImage>(
    `/menu-items/${menuItemId}/images/${imageId}`,
    { method: "DELETE", token },
  );
}
