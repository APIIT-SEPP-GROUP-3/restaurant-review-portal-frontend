import { PaginationButton } from "@/components/ui/pagination-button";

import type { Pagination } from "@/types/api";
import type { MenuItemSearchParams } from "@/types/menu";

interface MenuPaginationProps {
  pagination: Pagination;
  filters: MenuItemSearchParams;
}

function pageHref(page: number, filters: MenuItemSearchParams): string {
  const query = new URLSearchParams();

  if (filters.search) query.set("search", filters.search);
  if (filters.isAvailable !== undefined) {
    query.set("isAvailable", String(filters.isAvailable));
  }
  if (filters.sortBy) query.set("sortBy", filters.sortBy);
  if (filters.sortOrder) query.set("sortOrder", filters.sortOrder);
  query.set("page", String(page));
  query.set("limit", String(filters.limit ?? 9));

  return `/menu?${query.toString()}`;
}

export function MenuPagination({
  pagination,
  filters,
}: MenuPaginationProps) {
  if (pagination.totalPages <= 1) return null;

  return (
    <nav
      aria-label="Menu pagination"
      className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white p-4"
    >
      {pagination.page > 1 ? (
        <PaginationButton href={pageHref(pagination.page - 1, filters)}>
          ← Previous
        </PaginationButton>
      ) : (
        <PaginationButton disabled>← Previous</PaginationButton>
      )}
      <p className="text-sm text-zinc-600">
        Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
      </p>
      {pagination.page < pagination.totalPages ? (
        <PaginationButton href={pageHref(pagination.page + 1, filters)}>
          Next →
        </PaginationButton>
      ) : (
        <PaginationButton disabled>Next →</PaginationButton>
      )}
    </nav>
  );
}
