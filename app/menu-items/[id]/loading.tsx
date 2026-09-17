export default function MenuItemLoading() {
  return (
    <section className="flex flex-1 items-center justify-center bg-orange-50/40 px-4 py-20">
      <div className="text-center" role="status">
        <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
        <p className="mt-4 font-semibold text-zinc-700">Loading menu item...</p>
      </div>
    </section>
  );
}
