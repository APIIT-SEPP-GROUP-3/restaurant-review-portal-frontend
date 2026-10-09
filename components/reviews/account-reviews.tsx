"use client";
import { PaginationButton } from "@/components/ui/pagination-button";
import { useAuthUser } from "@/hooks/use-auth-user";
import { ModerationSidebar } from "@/components/moderation/moderation-sidebar";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { WorkspaceTabs } from "@/components/workspace/workspace-tabs";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { WorkspaceShell, WorkspaceSidebar, WorkspaceHeader } from "@/components/workspace/workspace-shell";
import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { Pagination } from "@/components/workspace/pagination";
import { TableSkeleton } from "@/components/ui/loading-layouts";
import { formatDate } from "@/lib/format-date";
interface Posting { id: number; restaurantId?: number; reviewId?: number; title?: string; reviewText?: string; commentText?: string; moderationStatus: string; rejectionReason: string | null; moderatedBy?: number | null; moderatedAt?: string | null; createdAt: string; restaurant?: { name: string }; menuItem?: { name: string } | null }
export function AccountReviews({ history = false }: { history?: boolean }) {
  const user = useAuthUser();
  const [selected, setSelected] = useState<Posting | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [items, setItems] = useState<Posting[]>([]), [loading, setLoading] = useState(true), [error, setError] = useState("");
  const [page, setPage] = useState(1), [kind, setKind] = useState("reviews"), [more, setMore] = useState(false), [refresh, setRefresh] = useState(0);
  useEffect(() => {
    const token = getAuthToken(); if (!token) return;
    let active = true;
    const request = history ? apiRequest<{ reviews: Posting[]; comments: Posting[] }>(`/moderation/history?page=${page}&limit=10`, { token }).then(data => data[kind as "reviews" | "comments"]) : apiRequest<Posting[]>("/me/reviews", { token });
    request.then(data => { if (active) { setItems(data); setMore(data.length === 10); } }).catch(e => { if (active) setError(e.message); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [history, page, kind, refresh]);
  const visible = history ? items : items.slice((page - 1) * 10, page * 10);
  const historyItems = items.filter(item =>
    (filter === "all" || item.moderationStatus === filter) &&
    `${item.id} ${item.title ?? ""} ${item.reviewText ?? item.commentText ?? ""} ${item.rejectionReason ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  function decisionBadge(item: Posting) {
    return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${item.moderationStatus === "APPROVED" ? "bg-success-soft text-success-text" : "bg-danger-soft text-danger-text"}`}>{item.moderationStatus === "APPROVED" ? "Approved" : "Rejected"}</span>;
  }
  if (history) return <>
    <WorkspaceShell label="Moderation history" sidebar={<ModerationSidebar active="history" firstName={user?.firstName ?? ""} />} footer={
      <nav aria-label="History pagination" className="workspace-pagination"><p className="text-xs text-panel-muted">Page {page} · 10 per page</p><div className="flex items-center gap-2"><PaginationButton disabled={loading || page === 1} onClick={() => { setLoading(true); setError(""); setPage(x => x - 1); }}>Previous</PaginationButton><PaginationButton aria-current="page" aria-label={`Page ${page}`} disabled={loading}>{page}</PaginationButton><PaginationButton disabled={loading || !more} onClick={() => { setLoading(true); setError(""); setPage(x => x + 1); }}>Next</PaginationButton></div></nav>
    }>
      <WorkspaceHeader breadcrumb="Moderation / History" title="Decision history" description="View finalized reviews, comments, and owner responses." actions={<button disabled={loading} className="workspace-button" onClick={() => { setLoading(true); setError(""); setRefresh(x => x + 1); }}>Refresh</button>} />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><WorkspaceTabs label="History posting type" value={kind} options={[{ value: "reviews", label: "Customer reviews" }, { value: "comments", label: "Comments & replies" }]} onChange={value => { setKind(value); setPage(1); setSearch(""); setLoading(true); setError(""); }} /><label><span className="sr-only">Filter decision on this page</span><select value={filter} onChange={e => setFilter(e.target.value)} className="workspace-input text-sm"><option value="all">All decisions on this page</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label></div>
      <label className="mt-4 block max-w-sm"><span className="sr-only">Search history on this page</span><input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search submissions on this page" className="workspace-input" /></label>
      {error ? <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger-text">{error}</p> : null}
      <div className="workspace-card mt-5 overflow-hidden"><div className="flex flex-wrap justify-between gap-2 border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">Finalized submissions</h3><span className="text-xs text-panel-muted">{loading ? "Loading…" : `${historyItems.length} matching · ${items.length} on this page`}</span></div>
        {loading ? <TableSkeleton label="Loading decision history" /> : !historyItems.length ? <p className="p-8 text-center text-sm text-panel-muted">{error ? "Decision history could not be loaded." : "No decisions match this page."}</p> : <WorkspaceTable label="Decision history" onRowClick={id => setSelected(items.find(item => item.id === id) ?? null)} header={<tr><th>Submission</th><th>Decision</th><th className="hidden md:table-cell">Moderator</th><th className="hidden lg:table-cell">Decided</th><th>Actions</th></tr>}>
          {historyItems.map(item => <tr key={item.id} data-record-id={item.id}><td className="max-w-xs px-5 py-3"><button className="block w-full text-left" onClick={() => setSelected(item)}><span className="block truncate font-semibold">{item.title || `${kind === "comments" ? "Comment" : "Review"} #${item.id}`}</span><span className="mt-1 block truncate text-xs text-panel-muted">{item.reviewText ?? item.commentText}</span></button></td><td className="px-4 py-3">{decisionBadge(item)}</td><td className="hidden px-4 py-3 text-panel-muted md:table-cell">{item.moderatedBy ? `#${item.moderatedBy}` : "—"}</td><td className="hidden whitespace-nowrap px-4 py-3 text-xs text-panel-muted lg:table-cell">{item.moderatedAt ? formatDate(item.moderatedAt) : "—"}</td><td className="px-3 py-3 text-right"><button className="workspace-button" onClick={() => setSelected(item)}>View details</button></td></tr>)}
        </WorkspaceTable>}
      </div>
    </WorkspaceShell>
    {selected ? <WorkspaceDialog busy={false} title={`Decision details · #${selected.id}`} onClose={() => setSelected(null)}><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-xl font-semibold">{selected.title || `${kind === "comments" ? "Comment" : "Review"} #${selected.id}`}</h3>{decisionBadge(selected)}</div><p className="mt-4 whitespace-pre-line break-words text-sm leading-7">{selected.reviewText ?? selected.commentText}</p><dl className="mt-5 grid gap-4 rounded-xl bg-panel-subtle p-4 sm:grid-cols-2"><div><dt className="text-xs text-panel-muted">Submitted</dt><dd className="mt-1 text-sm">{formatDate(selected.createdAt)}</dd></div><div><dt className="text-xs text-panel-muted">Decision date</dt><dd className="mt-1 text-sm">{selected.moderatedAt ? formatDate(selected.moderatedAt) : "Unavailable"}</dd></div><div><dt className="text-xs text-panel-muted">Moderator</dt><dd className="mt-1 text-sm">{selected.moderatedBy ? `#${selected.moderatedBy}` : "Unavailable"}</dd></div><div><dt className="text-xs text-panel-muted">{selected.reviewId ? "Parent review" : "Restaurant"}</dt><dd className="mt-1 text-sm">#{selected.reviewId ?? selected.restaurantId ?? "—"}</dd></div></dl>{selected.rejectionReason ? <p className="mt-4 rounded-xl bg-danger-soft p-4 text-sm text-danger-text">Rejection reason: {selected.rejectionReason}</p> : null}<p className="mt-4 text-xs text-panel-muted">This moderation decision is final.</p></WorkspaceDialog> : null}
  </>;
  return <WorkspaceShell label="My reviews" sidebar={<WorkspaceSidebar title="My account" navigation={<WorkspaceNavigation label="Account navigation" active="records" items={[{ id: "profile", label: "My profile", href: "/profile" }, { id: "records", label: "My reviews", href: "/my-reviews" }]} />} />}>
    <WorkspaceHeader title={history ? "Decision history" : "My reviews"} description={history ? "Finalized moderation decisions, including rejection reasons and decision details." : "Track your restaurant and meal reviews, including pending and rejected submissions."} actions={<button disabled={loading} className="workspace-button" onClick={() => { setLoading(true); setError(""); setRefresh(x => x + 1); }}>Refresh</button>} />
    {error ? <p role="alert" className="mt-4 text-danger-text">{error}</p> : null}
    <div className="mt-6 space-y-4">{loading ? <TableSkeleton label="Loading submissions" /> : !visible.length ? <div className="workspace-card p-8 text-center text-panel-muted">No submissions to display.</div> : visible.map(item => <article key={item.id} className="workspace-card p-5 sm:p-6"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{item.title || item.restaurant?.name || `${kind === "comments" ? "Comment" : "Review"} #${item.id}`}</h3><p className="mt-1 text-xs text-panel-muted">{item.menuItem?.name ?? item.restaurant?.name} · {formatDate(item.createdAt)}</p></div><span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold">{item.moderationStatus}</span></div><p className="mt-4 whitespace-pre-line break-words text-sm leading-6">{item.reviewText ?? item.commentText}</p>{item.rejectionReason ? <p className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger-text">Rejection reason: {item.rejectionReason}</p> : null}{history ? <p className="mt-4 text-xs text-panel-muted">Moderator #{item.moderatedBy ?? "—"} · {item.moderatedAt ? formatDate(item.moderatedAt) : "Decision date unavailable"}</p> : item.restaurantId && item.moderationStatus === "APPROVED" ? <Link href={`/restaurants/${item.restaurantId}`} className="workspace-button mt-4">View restaurant</Link> : <p className="mt-4 text-xs text-panel-muted">{item.moderationStatus === "PENDING" ? "Awaiting moderation. Your review will become public after approval." : "This review is not publicly visible."}</p>}</article>)}</div>
    <Pagination page={page} total={items.length} loading={loading} onPageChange={setPage} />
  </WorkspaceShell>;
}
