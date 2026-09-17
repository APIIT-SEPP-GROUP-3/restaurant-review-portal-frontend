export default function HomeLoading() {
  return (
    <section className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-orange-50/50 px-4">
      <div className="text-center" role="status">
        <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="mt-4 font-semibold text-zinc-700">Loading DineRate...</p>
      </div>
    </section>
  );
}
