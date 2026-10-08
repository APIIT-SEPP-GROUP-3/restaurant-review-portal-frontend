import Link from "next/link";

import { MenuItemCard } from "@/components/menu/menu-item-card";
import type { PublicMenuItem } from "@/types/menu";

interface FeaturedMenuItemsProps {
  menuItems: PublicMenuItem[];
  errorMessage?: string;
}

export function FeaturedMenuItems({
  menuItems,
  errorMessage,
}: FeaturedMenuItemsProps) {
  return (
    <section className="bg-orange-50/60 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
              Menu discovery
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              Fresh choices from local menus
            </h2>
            <p className="mt-3 text-zinc-600">
              Browse recently added dishes that restaurants currently mark as available.
            </p>
          </div>
          <Link
            href="/menu"
            className="rounded-full border border-orange-200 bg-white px-5 py-2.5 font-semibold text-orange-600 hover:bg-orange-50"
          >
            Explore the full menu
          </Link>
        </div>

        {errorMessage ? (
          <p className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-800">
            {errorMessage}
          </p>
        ) : menuItems.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {menuItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
            <h3 className="text-xl font-bold text-zinc-950">No menu items yet</h3>
            <p className="mt-2 text-zinc-600">
              Available menu items will appear here after restaurants publish them.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
