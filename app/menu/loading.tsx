import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div role="status" aria-busy="true" aria-label="Loading menu items" className="flex-1 bg-brand-soft">
    <span className="sr-only">Loading menu items</span>
    <div className="bg-zinc-950 px-4 py-10 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-4"><Skeleton className="h-4 w-36 opacity-30" /><Skeleton className="h-12 w-3/4 max-w-2xl opacity-30" /><Skeleton className="h-6 w-2/3 max-w-xl opacity-30" /></div></div>
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="workspace-card grid gap-4 p-5 sm:grid-cols-3">{[0, 1, 2].map(index => <Skeleton key={index} className="h-12" />)}</div>
      <Skeleton className="mb-5 mt-10 h-4 w-32" />
      <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index} className="flex overflow-hidden rounded-2xl border border-panel-border bg-white"><Skeleton className="min-h-48 w-28 shrink-0 rounded-none sm:w-40" /><div className="flex-1 space-y-4 p-5"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-3/4" /><Skeleton className="h-4" /><Skeleton className="h-6 w-1/3" /></div></div>)}</div>
    </div>
  </div>;
}
