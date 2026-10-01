"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Restaurants", href: "/restaurants" },
  { label: "Menu", href: "/menu" },
  { label: "About", href: "/#about" },
];

interface NavigationLinksProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

function isActiveLink(pathname: string, href: string): boolean {
  if (href.includes("#")) {
    return false;
  }

  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/menu") {
    return pathname === "/menu" || pathname.startsWith("/menu-items/");
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavigationLinks({
  mobile = false,
  onNavigate,
}: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={mobile ? "Mobile navigation" : "Main navigation"}
      className={mobile ? "flex flex-col gap-1" : "flex items-center gap-8"}
    >
      {navigationLinks.map((link) => {
        const isActive = isActiveLink(pathname, link.href);

        return (
          <Link
            key={link.label}
            href={link.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={
              mobile
                ? `rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
                    isActive
                      ? "bg-orange-50 text-orange-600"
                      : "text-zinc-700 hover:bg-zinc-50 hover:text-orange-600"
                  }`
                : `text-sm font-medium transition-colors ${
                    isActive
                      ? "text-orange-600"
                      : "text-zinc-600 hover:text-orange-500"
                  }`
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
