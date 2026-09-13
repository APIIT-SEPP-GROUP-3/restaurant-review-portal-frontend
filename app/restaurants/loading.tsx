export default function RestaurantsLoading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading restaurants"
      className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl animate-pulse">
        <span className="sr-only">Loading restaurants...</span>

        <div className="h-4 w-52 rounded-full bg-orange-200" />
        <div className="mt-5 h-12 max-w-3xl rounded-2xl bg-zinc-200" />
        <div className="mt-4 h-6 max-w-2xl rounded-xl bg-zinc-200" />

        <div className="mt-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-20 rounded-xl bg-zinc-100 lg:col-span-2" />
            <div className="h-20 rounded-xl bg-zinc-100" />
            <div className="h-20 rounded-xl bg-zinc-100" />
          </div>
          <div className="mt-4 h-20 rounded-xl bg-zinc-100" />
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-orange-100 bg-white"
            >
              <div className="h-52 bg-orange-100" />
              <div className="space-y-4 p-5">
                <div className="h-4 w-24 rounded-full bg-orange-100" />
                <div className="h-7 w-2/3 rounded-lg bg-zinc-200" />
                <div className="h-4 w-full rounded bg-zinc-100" />
                <div className="h-4 w-4/5 rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
