import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-lg shadow-orange-100/60 sm:p-10">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-orange-100 text-2xl font-bold text-orange-600">
          ?
        </span>

        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Restaurant not found
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-tight text-zinc-950">
          We could not find that restaurant
        </h1>

        <p className="mt-4 leading-7 text-zinc-600">
          The restaurant may no longer be available, or the link may be
          incorrect.
        </p>

        <Link
          href="/restaurants"
          className="mt-7 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          Browse restaurants
        </Link>
      </div>
    </section>
  );
}
