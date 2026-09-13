import Link from "next/link";

import type {
  RestaurantCategory,
  RestaurantSearchParams,
} from "@/types/restaurant";

interface RestaurantFiltersProps {
  categories: RestaurantCategory[];
  filters: RestaurantSearchParams;
}

export function RestaurantFilters({
  categories,
  filters,
}: RestaurantFiltersProps) {
  return (
    <form
      action="/restaurants"
      method="get"
      className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <label
            htmlFor="restaurant-search"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            Search
          </label>

          <input
            id="restaurant-search"
            name="search"
            type="search"
            defaultValue={filters.search}
            placeholder="Restaurant name, description, or menu item"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <div>
          <label
            htmlFor="restaurant-city"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            City
          </label>

          <input
            id="restaurant-city"
            name="city"
            type="text"
            defaultValue={filters.city}
            placeholder="e.g. Colombo"
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
        </div>

        <div>
          <label
            htmlFor="restaurant-category"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            Category
          </label>

          <select
            id="restaurant-category"
            name="categoryId"
            defaultValue={filters.categoryId?.toString() ?? ""}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">All categories</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <label
            htmlFor="restaurant-sort"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            Sort by
          </label>

          <select
            id="restaurant-sort"
            name="sortBy"
            defaultValue={filters.sortBy ?? "name"}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="name">Name</option>
            <option value="city">City</option>
            <option value="createdAt">Newest</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="restaurant-order"
            className="mb-2 block text-sm font-semibold text-zinc-800"
          >
            Order
          </label>

          <select
            id="restaurant-order"
            name="sortOrder"
            defaultValue={filters.sortOrder ?? "asc"}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>

        <div className="flex items-end gap-3">
          <input type="hidden" name="limit" value="9" />

          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
          >
            Apply filters
          </button>

          <Link
            href="/restaurants"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 px-5 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Clear
          </Link>
        </div>
      </div>
    </form>
  );
}