import Link from "next/link";

import type { MenuItemSearchParams } from "@/types/menu";

interface MenuFiltersProps {
  filters: MenuItemSearchParams;
}

export function MenuFilters({ filters }: MenuFiltersProps) {
  return (
    <form
      action="/menu"
      method="get"
      className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <label className="lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Search menu items
          </span>
          <input
            name="search"
            type="search"
            defaultValue={filters.search}
            placeholder="Item name or description"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Availability
          </span>
          <select
            name="isAvailable"
            defaultValue={
              filters.isAvailable === undefined
                ? ""
                : String(filters.isAvailable)
            }
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">All items</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </label>

        <label>
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Sort by
          </span>
          <select
            name="sortBy"
            defaultValue={filters.sortBy ?? "name"}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="createdAt">Newest</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-52 flex-1">
          <span className="mb-2 block text-sm font-semibold text-zinc-800">
            Order
          </span>
          <select
            name="sortOrder"
            defaultValue={filters.sortOrder ?? "asc"}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>

        <input type="hidden" name="limit" value="9" />
        <button className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600">
          Apply filters
        </button>
        <Link
          href="/menu"
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
