"use client";

import { NavigationLink } from "@/components/layout/navigation-link";

export const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
];

export function NavigationLinks({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  return <nav aria-label={mobile ? "Mobile navigation" : "Main navigation"} className={mobile ? "flex flex-col gap-1" : "flex items-center gap-1"}>
    {navigationLinks.map(link => <NavigationLink key={link.href} href={link.href} mobile={mobile} onNavigate={onNavigate}>{link.label}</NavigationLink>)}
  </nav>;
}
