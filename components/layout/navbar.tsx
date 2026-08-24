import Link from "next/link";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "Restaurants", href: "/#featured" },
  { label: "About", href: "/#about" },
];

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

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-orange-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-orange-50 sm:inline-flex"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}