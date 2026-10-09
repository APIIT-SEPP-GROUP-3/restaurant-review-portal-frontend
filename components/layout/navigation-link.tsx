"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function isNavigationActive(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  if (href === "/") return pathname === "/";
  if (href === "/menu" && pathname.startsWith("/menu-items/")) return true;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationLink({ href, children, mobile = false, onNavigate, activeHrefs }: {
  href: string; children: ReactNode; mobile?: boolean; onNavigate?: () => void; activeHrefs?: string[];
}) {
  const pathname = usePathname();
  const active = (activeHrefs ?? [href]).some(path => isNavigationActive(pathname, path));
  return <Link href={href} onClick={onNavigate} aria-current={active ? "page" : undefined} className={`navigation-link ${mobile ? "navigation-link-mobile" : ""}`}>{children}</Link>;
}
