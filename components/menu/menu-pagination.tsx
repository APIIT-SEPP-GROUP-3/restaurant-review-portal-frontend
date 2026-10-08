import Link from "next/link";

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
      className="mt-10 flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-4"
    >
      {pagination.page > 1 ? (
        <Link href={pageHref(pagination.page - 1, filters)} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700">
          ← Previous
        </Link>
      ) : (
        <span className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400">← Previous</span>
      )}
      <p className="text-sm text-zinc-600">
        Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
      </p>
      {pagination.page < pagination.totalPages ? (
        <Link href={pageHref(pagination.page + 1, filters)} className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700">
          Next →
        </Link>
      ) : (
        <span className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-400">Next →</span>
      )}
    </nav>
  );
}
