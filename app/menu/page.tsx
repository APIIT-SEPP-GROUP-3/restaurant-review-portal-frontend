import type { Metadata } from "next";

import { MenuFilters } from "@/components/menu/menu-filters";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { MenuPagination } from "@/components/menu/menu-pagination";
import { ApiError } from "@/lib/api-client";
import { getPublicMenuItems } from "@/services/menu-service";
import type { Pagination } from "@/types/api";
import type {
  MenuItemSearchParams,
  MenuItemSortField,
  MenuSortOrder,
  PublicMenuItem,
} from "@/types/menu";

export const metadata: Metadata = {
  title: "Menu discovery",
  description: "Search and discover restaurant menu items with DineRate.",
};

type SearchParamValue = string | string[] | undefined;

interface MenuPageProps {
  searchParams: Promise<Record<string, SearchParamValue>>;
}

function single(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function positiveInteger(value: SearchParamValue, fallback: number): number {
  const parsed = Number(single(value));
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function sortField(value: SearchParamValue): MenuItemSortField {
  const field = single(value);
  return field === "price" || field === "createdAt" ? field : "name";
}

function sortOrder(value: SearchParamValue): MenuSortOrder {
  return single(value) === "desc" ? "desc" : "asc";
}

function availability(value: SearchParamValue): boolean | undefined {
  const selected = single(value);
  if (selected === "true") return true;
  if (selected === "false") return false;
  return undefined;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const query = await searchParams;
  const filters: MenuItemSearchParams = {
    search: single(query.search)?.trim() || undefined,
    isAvailable: availability(query.isAvailable),
    page: positiveInteger(query.page, 1),
    limit: 9,
    sortBy: sortField(query.sortBy),
    sortOrder: sortOrder(query.sortOrder),
  };

  let menuItems: PublicMenuItem[] = [];
  let errorMessage = "";
  let pagination: Pagination = {
    page: filters.page ?? 1,
    limit: 9,
    total: 0,
    totalPages: 0,
  };

  try {
    const result = await getPublicMenuItems(filters);
    menuItems = result.menuItems;
    pagination = result.pagination;
  } catch (error) {
    errorMessage =
      error instanceof ApiError
        ? error.message
        : "Unable to load menu items. Please try again.";
  }

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">Menu discovery</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">Discover your next favourite dish</h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">Search menus across restaurants and compare dishes, prices, and availability.</p>
        </div>

        <div className="mt-8"><MenuFilters filters={filters} /></div>

        {errorMessage ? (
          <p role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{errorMessage}</p>
        ) : (
          <>
            <p className="mt-10 text-sm text-zinc-600"><strong className="text-zinc-950">{pagination.total}</strong> {pagination.total === 1 ? "menu item" : "menu items"} found</p>
            {menuItems.length > 0 ? (
              <div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {menuItems.map((item) => <MenuItemCard key={item.id} item={item} />)}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
                <h2 className="text-xl font-bold text-zinc-950">No menu items found</h2>
                <p className="mt-2 text-zinc-600">Try changing or clearing your search filters.</p>
              </div>
            )}
            <MenuPagination pagination={pagination} filters={filters} />
          </>
        )}
      </div>
    </section>
  );
}
