import Link from "next/link";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { NavigationLinks } from "@/components/layout/navigation-links";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-zinc-900"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500 text-white">
            D
          </span>

          <span>
            Dine<span className="text-orange-500">Rate</span>
          </span>
        </Link>

        <div className="hidden md:block">
          <NavigationLinks />
        </div>

        <div className="hidden md:block">
          <AuthNavigation />
        </div>

        <MobileNavigation />
      </div>
    </header>
  );
}
