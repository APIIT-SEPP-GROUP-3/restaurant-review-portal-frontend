import type { Pagination } from "@/types/api";
import type {
  MenuCategory,
  MenuItem,
  MenuItemImage,
} from "@/types/restaurant";

export type MenuItemSortField = "name" | "price" | "createdAt";
export type MenuSortOrder = "asc" | "desc";

export interface MenuItemRestaurant {
  id: number;
  name: string;
  city: string;
}

export interface PublicMenuItem extends MenuItem {
  restaurant: MenuItemRestaurant;
  menuCategory: MenuCategory;
  images: MenuItemImage[];
}

export interface MenuItemSearchParams {
  search?: string;
  restaurantId?: number;
  menuCategoryId?: number;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: MenuItemSortField;
  sortOrder?: MenuSortOrder;
}

export interface MenuItemSearchResult {
  menuItems: PublicMenuItem[];
  pagination: Pagination;
}
