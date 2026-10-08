import Link from "next/link";

import type { Pagination } from "@/types/api";
import type { RestaurantSearchParams } from "@/types/restaurant";

const PAGINATION_LIMIT = 9;

interface RestaurantPaginationProps {
  pagination: Pagination;
  filters: RestaurantSearchParams;
}

function createPageHref(
  page: number,
  filters: RestaurantSearchParams,
): string {
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

  if (filters.sortBy) {
    query.set("sortBy", filters.sortBy);
  }

  if (filters.sortOrder) {
    query.set("sortOrder", filters.sortOrder);
  }

  query.set("page", String(page));
  query.set("limit", String(filters.limit ?? PAGINATION_LIMIT));

  return `/restaurants?${query.toString()}`;
}


export function RestaurantPagination({
  pagination,
  filters,
}: RestaurantPaginationProps) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  const hasPreviousPage = pagination.page > 1;
  const hasNextPage = pagination.page < pagination.totalPages;

  return (
    <nav
      aria-label="Restaurant pagination"
      className="mt-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-orange-100 bg-white p-4 sm:flex-row"
    >
      {hasPreviousPage ? (
        <Link
          href={createPageHref(pagination.page - 1, filters)}
          className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          ← Previous
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400">
          ← Previous
        </span>
      )}

      <p className="text-sm text-zinc-600">
        Page{" "}
        <strong className="text-zinc-900">{pagination.page}</strong> of{" "}
        <strong className="text-zinc-900">{pagination.totalPages}</strong>
      </p>

      {hasNextPage ? (
        <Link
          href={createPageHref(pagination.page + 1, filters)}
          className="inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          Next →
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400">
          Next →
        </span>
      )}
    </nav>
  );
}