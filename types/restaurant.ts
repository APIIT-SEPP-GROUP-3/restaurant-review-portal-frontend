import type { Pagination } from "@/types/api";

export type RestaurantStatus = "ACTIVE" | "INACTIVE";
export type RestaurantSortField = "name" | "city" | "createdAt";
export type SortOrder = "asc" | "desc";

export interface RestaurantCategory {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantCategoryMapping {
  restaurantId: number;
  categoryId: number;
  createdAt: string;
  category: RestaurantCategory;
}

export interface RestaurantImage {
  id: number;
  restaurantId: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  createdAt: string;
}

export interface RestaurantSummary {
  id: number;
  ownerId: number;
  name: string;
  description: string | null;
  address: string;
  city: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  openingHours: string | null;
  status: RestaurantStatus;
  createdAt: string;
  updatedAt: string;
  categories: RestaurantCategoryMapping[];
  images: RestaurantImage[];
}

export interface RestaurantSearchParams {
  search?: string;
  city?: string;
  categoryId?: number;
  page?: number;
  limit?: number;
  sortBy?: RestaurantSortField;
  sortOrder?: SortOrder;
}

export interface RestaurantSearchResult {
  restaurants: RestaurantSummary[];
  pagination: Pagination;
}

export interface RestaurantOwner {
  id: number;
  firstName: string;
  lastName: string;
}

export interface MenuCategory {
  id: number;
  restaurantId: number;
  name: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  menuCategoryId: number;
  name: string;
  description: string | null;
  price: string | number;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantDetail extends RestaurantSummary {
  owner: RestaurantOwner;
  menuCategories: MenuCategory[];
  menuItems: MenuItem[];
}