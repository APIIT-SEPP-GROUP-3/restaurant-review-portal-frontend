import Link from "next/link";

export default function MenuItemNotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-orange-50/40 px-4 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-orange-100 text-3xl font-bold text-orange-600">
          ?
        </span>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Menu item not found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-950">
          We could not find that menu item
        </h1>
        <p className="mt-4 text-zinc-600">
          The item may no longer be available, or the link may be incorrect.
        </p>
        <Link
          href="/menu"
          className="mt-7 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
        >
          Browse menu items
        </Link>
      </div>
    </section>
  );
}
