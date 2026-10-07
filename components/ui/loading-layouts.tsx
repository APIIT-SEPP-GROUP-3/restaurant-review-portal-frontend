import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export function TableSkeleton({ label = "Loading records", rows = 5 }: { label?: string; rows?: number }) {
  return <div role="status" aria-busy="true" aria-label={label} className="p-5">
    <span className="sr-only">{label}</span>
    <div aria-hidden="true" className="space-y-5">
      {Array.from({ length: rows }, (_, index) => <div key={index} className="grid grid-cols-[2fr_1fr_1fr] items-center gap-5">
        <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
        <Skeleton className="h-4" /><Skeleton className="ml-auto h-9 w-20 rounded-full" />
      </div>)}
    </div>
  </div>;
}

export function ConversationSkeleton() {
  return <div role="status" aria-busy="true" aria-label="Loading conversation" className="mt-5 space-y-4">
    <span className="sr-only">Loading conversation</span>
    {[0, 1].map(index => <div key={index} className="space-y-3 rounded-2xl border border-panel-border p-4"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-2/3" /></div>)}
  </div>;
}

export function WorkspaceSkeleton({ title = "Restaurant management" }: { title?: string }) {
  return <WorkspaceShell label="Loading workspace" sidebar={<><h1 className="text-xl font-bold">{title}</h1><div className="mt-6 space-y-4">{[0, 1, 2, 3].map(index => <Skeleton key={index} className="h-10 opacity-20" />)}</div></>}>
    <div role="status" aria-busy="true" aria-label="Loading workspace"><span className="sr-only">Loading workspace</span><Skeleton className="h-8 w-2/3 max-w-md" /><Skeleton className="mt-3 h-4 w-1/2" /><div className="workspace-card mt-6"><TableSkeleton /></div></div>
  </WorkspaceShell>;
}

export function PageSkeleton({ variant = "cards" }: { variant?: "cards" | "detail" | "profile" | "auth" }) {
  return <section role="status" aria-busy="true" aria-label="Loading page" className="flex-1 bg-brand-soft/30 px-4 py-10 sm:px-6">
    <span className="sr-only">Loading page</span>
    <div className={`mx-auto ${variant === "auth" ? "max-w-md" : variant === "profile" ? "max-w-5xl" : "max-w-7xl"}`}>
      {variant === "detail" ? <Skeleton className="mb-8 h-64 w-full rounded-3xl sm:h-96" /> : null}
      <Skeleton className="h-9 w-3/4 max-w-md" /><Skeleton className="mt-4 h-4 w-1/2" />
      {variant === "cards" ? <><div className="workspace-card mt-8 grid gap-4 p-5 sm:grid-cols-3">{[0, 1, 2].map(index => <Skeleton key={index} className="h-12" />)}</div><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="workspace-card overflow-hidden"><Skeleton className="h-48 rounded-none" /><div className="space-y-3 p-5"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4" /><Skeleton className="h-4 w-4/5" /></div></div>)}</div></> :
        <div className="workspace-card mt-8 space-y-5 p-6">{[0, 1, 2, 3].map(index => <Skeleton key={index} className={variant === "auth" ? "h-12" : "h-16"} />)}</div>}
    </div>
  </section>;
}
