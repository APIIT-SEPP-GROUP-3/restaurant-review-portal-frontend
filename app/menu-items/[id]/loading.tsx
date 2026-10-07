import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <div role="status" aria-busy="true" aria-label="Loading dish details" className="flex-1 bg-brand-soft">
    <span className="sr-only">Loading dish details</span>
    <div className="bg-zinc-900 px-4 py-10 sm:px-6"><div className="mx-auto max-w-6xl"><div className="max-w-xl space-y-5 rounded-3xl border border-white/20 p-8"><Skeleton className="h-9 w-32 opacity-30" /><Skeleton className="h-12 w-3/4 opacity-30" /><Skeleton className="h-6 opacity-30" /><Skeleton className="h-8 w-40 opacity-30" /><Skeleton className="h-10 w-48 rounded-full opacity-30" /></div></div></div>
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6"><Skeleton className="h-44 rounded-3xl" /><Skeleton className="h-8 w-48" /><Skeleton className="h-40 rounded-3xl" /></div>
  </div>;
}
