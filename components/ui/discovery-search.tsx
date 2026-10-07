import Link from "next/link";
import type { ReactNode } from "react";

export function DiscoverySearch({ action, children, sorting, label }: { action: string; children: ReactNode; sorting: ReactNode; label: string }) {
  return <form action={action} method="get" aria-label={label} className="discovery-search">
    <div className="discovery-search-bar">
      {children}
      <button type="submit" className="discovery-search-submit"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>Search</button>
    </div>
    <div className="discovery-search-options">
      <div className="discovery-search-sorting">{sorting}</div>
      <Link href={action} className="discovery-search-reset">Clear filters</Link>
    </div>
    <input type="hidden" name="limit" value="9" />
  </form>;
}

export function DiscoverySearchField({ label, children, wide = false }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`discovery-search-field${wide ? " discovery-search-field-wide" : ""}`}><span>{label}</span>{children}</label>;
}

export function DiscoverySortField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="discovery-search-sort"><span>{label}</span>{children}</label>;
}
