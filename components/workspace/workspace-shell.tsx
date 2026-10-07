import Link from "next/link";
import type { ReactNode } from "react";

export function WorkspaceShell({ sidebar, children, footer, label, className = "" }: {
  sidebar: ReactNode; children: ReactNode; footer?: ReactNode; label: string; className?: string;
}) {
  return <section className={`staff-workspace min-h-0 flex-1 overflow-hidden ${className}`}>
    <div className="workspace-grid">
      <aside className="workspace-sidebar">{sidebar}</aside>
      <div className="flex min-h-0 min-w-0 flex-col">
        <div tabIndex={0} role="region" aria-label={label} className="workspace-content">{children}</div>
        {footer}
      </div>
    </div>
  </section>;
}

export function WorkspaceSidebar({ title, identity, navigation, children }: {
  title: string; identity?: string; navigation: ReactNode; children?: ReactNode;
}) {
  return <>
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">DineRate workspace</p>
    <h1 className="mt-2 text-xl font-bold">{title}</h1>
    {identity ? <p className="mt-2 text-xs text-white/50">{identity}</p> : null}
    {navigation}
    <div className="mt-6 hidden space-y-3 border-t border-white/10 pt-5 lg:block">
      {children}
      <Link href="/restaurants" className="block text-sm text-white/60 hover:text-white">View public site ↗</Link>
    </div>
  </>;
}

export function WorkspaceHeader({ breadcrumb, title, description, actions }: {
  breadcrumb: string; title: string; description: string; actions?: ReactNode;
}) {
  return <header className="flex flex-wrap items-start justify-between gap-4">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-panel-muted">{breadcrumb}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-panel-muted">{description}</p>
    </div>{actions}
  </header>;
}
