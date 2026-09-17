import Link from "next/link";

import type { ManagedMenuItem } from "@/types/restaurant";

interface RestaurantMenuProps {
  menuItems: ManagedMenuItem[];
}

export function RestaurantMenu({ menuItems }: RestaurantMenuProps) {
  const groupedItems = menuItems.reduce<Map<number, ManagedMenuItem[]>>(
    (groups, item) => {
      const group = groups.get(item.menuCategory.id) ?? [];
      group.push(item);
      groups.set(item.menuCategory.id, group);
      return groups;
    },
    new Map(),
  );

  return (
    <section className="mt-12">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
        Restaurant menu
      </p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-bold text-zinc-950">Explore the menu</h2>
        <Link href="/menu" className="font-semibold text-orange-600 hover:text-orange-700">
          Browse all menu items →
        </Link>
      </div>

      {menuItems.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white p-10 text-center">
          <h3 className="text-xl font-bold text-zinc-950">Menu coming soon</h3>
          <p className="mt-2 text-zinc-600">
            This restaurant has not published any menu items yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {Array.from(groupedItems.values()).map((items) => (
            <div key={items[0].menuCategory.id}>
              <h3 className="text-xl font-bold text-zinc-950">
                {items[0].menuCategory.name}
              </h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {items.map((item) => {
                  const primaryImage =
                    item.images.find((image) => image.isPrimary) ?? item.images[0];

                  return (
                    <Link
                      key={item.id}
                      href={`/menu-items/${item.id}`}
                      className="group flex overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:border-orange-200 hover:shadow-md"
                    >
                      <div className="h-32 w-32 shrink-0 bg-gradient-to-br from-orange-100 to-amber-100">
                        {primaryImage ? (
                          // Images are supplied dynamically by the backend.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage.imageUrl}
                            alt={primaryImage.altText ?? item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-bold text-orange-500">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center p-4">
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-zinc-950 group-hover:text-orange-600">
                            {item.name}
                          </h4>
                          <span className="shrink-0 text-sm font-bold text-zinc-950">
                            LKR {Number(item.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                          {item.description ?? "View this menu item for more details."}
                        </p>
                        <span
                          className={`mt-3 text-xs font-semibold ${
                            item.isAvailable ? "text-green-700" : "text-zinc-500"
                          }`}
                        >
                          {item.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
