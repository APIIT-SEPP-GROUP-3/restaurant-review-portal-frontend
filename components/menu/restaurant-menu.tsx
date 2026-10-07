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

  const groups = Array.from(groupedItems.values()).sort(
    (first, second) => first[0].menuCategory.displayOrder - second[0].menuCategory.displayOrder,
  );

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-3xl font-bold text-zinc-950">On the menu</h2>
      </div>

      {groups.length > 1 ? (
        <nav aria-label="Menu categories" className="mt-5 flex flex-wrap gap-2">
          {groups.map(items => <a key={items[0].menuCategory.id} href={`#menu-category-${items[0].menuCategory.id}`} className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:border-orange-300 hover:text-orange-700">{items[0].menuCategory.name} <span className="ml-1 text-zinc-400">{items.length}</span></a>)}
        </nav>
      ) : null}

      {menuItems.length === 0 ? (
        <div className="mt-6 rounded-3xl border border-dashed border-orange-200 bg-white p-6 text-center sm:p-8">
          <h3 className="text-xl font-bold text-zinc-950">Menu coming soon</h3>
          <p className="mt-2 text-zinc-600">
            This restaurant has not published any menu items yet.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {groups.map((items) => (
            <div key={items[0].menuCategory.id} id={`menu-category-${items[0].menuCategory.id}`} className="scroll-mt-24">
              <h3 className="text-xl font-bold text-zinc-950">
                {items[0].menuCategory.name}
              </h3>
              <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                  const primaryImage =
                    item.images.find((image) => image.isPrimary) ?? item.images[0];

                  return (
                    <Link
                      key={item.id}
                      href={`/menu-items/${item.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-orange-100 bg-white/75 transition duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-500"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                        {primaryImage ? (
                          // Images are supplied dynamically by the backend.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={primaryImage.imageUrl}
                            alt={primaryImage.altText ?? item.name}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-2xl font-bold text-orange-500">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col p-5">
                        <div className="space-y-2">
                          <h4 className="text-base font-bold text-zinc-950 group-hover:text-orange-600 sm:text-lg">
                            {item.name}
                          </h4>
                          <span className="block text-sm font-bold text-orange-700">
                            LKR {new Intl.NumberFormat("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(item.price))}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">
                          {item.description ?? "View this menu item for more details."}
                        </p>
                        <span
                          className={`mt-4 w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.isAvailable ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-500"
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
