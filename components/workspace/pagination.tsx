import { PaginationButton } from "@/components/ui/pagination-button";
import { Skeleton } from "@/components/ui/skeleton";

export const WORKSPACE_PAGE_SIZE = 10;

export function Pagination({ page, total, onPageChange, loading = false, label = "Records pagination" }: {
  page: number; total: number; onPageChange: (page: number) => void; loading?: boolean; label?: string;
}) {
  const count = Math.max(1, Math.ceil(total / WORKSPACE_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), count);
  const pages = Array.from({ length: count }, (_, index) => index + 1)
    .filter(number => number === 1 || number === count || Math.abs(number - current) <= 2);
  return <nav aria-label={label} className="workspace-pagination">
    {loading ? <Skeleton className="h-4 w-40" /> : <p className="text-xs text-panel-muted">{total ? `Showing ${(current - 1) * WORKSPACE_PAGE_SIZE + 1}–${Math.min(current * WORKSPACE_PAGE_SIZE, total)} of ${total}` : "No records"} · {WORKSPACE_PAGE_SIZE} per page</p>}
    <div className="flex flex-wrap items-center gap-2">
      <PaginationButton type="button" disabled={loading || current === 1} onClick={() => onPageChange(current - 1)}>Previous</PaginationButton>
      {pages.map((number, index) => <span key={number} className="flex items-center">
        {index > 0 && number - pages[index - 1] > 1 ? <span className="px-2 text-zinc-400">…</span> : null}
        <PaginationButton type="button" aria-label={`Page ${number}`} aria-current={number === current ? "page" : undefined} disabled={loading} onClick={() => onPageChange(number)}>{number}</PaginationButton>
      </span>)}
      <PaginationButton type="button" disabled={loading || current === count} onClick={() => onPageChange(current + 1)}>Next</PaginationButton>
    </div>
  </nav>;
}
