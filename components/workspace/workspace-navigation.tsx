import Link from "next/link";

type NavigationItem = { id: string; label: string; href?: string };

export function WorkspaceNavigation({ label, items, active, onSelect, disabled = false }: {
  label: string; items: NavigationItem[]; active: string;
  onSelect?: (id: string) => void; disabled?: boolean;
}) {
  return <nav aria-label={label} className="workspace-navigation">
    {items.map(item => item.href ? <Link key={item.id} href={item.href} aria-current={active === item.id ? "page" : undefined} className="workspace-nav-item">{item.label}</Link> :
      <button key={item.id} type="button" disabled={disabled} aria-pressed={active === item.id} onClick={() => onSelect?.(item.id)} className="workspace-nav-item">{item.label}</button>)}
  </nav>;
}
