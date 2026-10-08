import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-orange-50/70 to-white px-4 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
        <p className="text-7xl font-bold text-orange-500">404</p>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
          Page not found
        </p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-950">
          This page is not on the menu
        </h1>
        <p className="mt-4 leading-7 text-zinc-600">
          The address may be incorrect, or the page may have been moved.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Return home
          </Link>
          <Link
            href="/restaurants"
            className="rounded-xl border border-orange-200 px-6 py-3 font-semibold text-orange-600 hover:bg-orange-50"
          >
            Browse restaurants
          </Link>
        </div>
      </div>
    </section>
  );
}
