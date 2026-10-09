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

export function WorkspaceSidebar({ title, identity, navigation, backLink }: {
  title: string; identity?: string; navigation: ReactNode;
  backLink?: { href: string; label: string };
}) {
  return <>
    <h1 className="text-xl font-bold">{title}</h1>
    {identity ? <p className="mt-2 text-xs text-white/50">{identity}</p> : null}
    {backLink ? <Link href={backLink.href} className="workspace-back-link"><span aria-hidden="true">←</span>{backLink.label}</Link> : null}
    {navigation}

  </>;
}

export function WorkspaceHeader({ breadcrumb, title, description, actions }: {
  breadcrumb?: string; title: string; description?: string; actions?: ReactNode;
}) {
  return <header className="flex flex-wrap items-start justify-between gap-4">
    <div>{breadcrumb ? <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-panel-muted">{breadcrumb}</p> : null}
      <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
      {description ? <p className="mt-2 text-sm text-panel-muted">{description}</p> : null}
    </div>{actions}
  </header>;
}
