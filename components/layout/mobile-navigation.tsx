"use client";

import { useEffect, useState } from "react";

import { AuthNavigation } from "@/components/layout/auth-navigation";
import { NavigationLinks } from "@/components/layout/navigation-links";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-panel"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex size-11 items-center justify-center rounded-xl border border-orange-200 text-zinc-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
      >
        <span className="sr-only">
          {isOpen ? "Close navigation menu" : "Open navigation menu"}
        </span>
        <span aria-hidden="true" className="relative block h-5 w-6">
          <span
            className={`absolute left-0 top-0.5 h-0.5 w-6 bg-current transition-transform ${
              isOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-2.5 h-0.5 w-6 bg-current transition-opacity ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-[1.125rem] h-0.5 w-6 bg-current transition-transform ${
              isOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation-panel"
          className="absolute inset-x-0 top-full border-b border-orange-100 bg-white px-4 py-5 shadow-xl"
        >
          <div className="mx-auto max-w-7xl">
            <NavigationLinks mobile onNavigate={closeMenu} />
            <div className="mt-4 border-t border-zinc-100 pt-4">
              <AuthNavigation mobile onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
