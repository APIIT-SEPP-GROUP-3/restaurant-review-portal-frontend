import Link from "next/link";
import Image from "next/image";

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
          <Image src="/dinerate-logo.png" alt="" width={44} height={44} className="size-11 shrink-0 object-contain" loading="eager" />

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
