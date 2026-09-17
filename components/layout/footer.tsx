import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xl font-bold text-white"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-orange-500">
              D
            </span>
            <span>
              Dine<span className="text-orange-500">Rate</span>
            </span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
            Discover great restaurants, explore honest customer experiences,
            and share reviews about every memorable meal.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-white">Explore</h2>

          <nav
            aria-label="Footer navigation"
            className="mt-4 flex flex-col items-start gap-3 text-sm"
          >
            <Link href="/" className="transition-colors hover:text-orange-400">
              Home
            </Link>
            <Link
              href="/restaurants"
              className="transition-colors hover:text-orange-400"
            >
              Restaurants
            </Link>
            <Link
              href="/menu"
              className="transition-colors hover:text-orange-400"
            >
              Menu
            </Link>
            <Link
              href="/#about"
              className="transition-colors hover:text-orange-400"
            >
              About
            </Link>
          </nav>
        </div>

        <div>
          <h2 className="font-semibold text-white">Your account</h2>

          <nav
            aria-label="Account navigation"
            className="mt-4 flex flex-col items-start gap-3 text-sm"
          >
            <Link
              href="/login"
              className="transition-colors hover:text-orange-400"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="transition-colors hover:text-orange-400"
            >
              Create an account
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-5 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
          © {currentYear} DineRate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
