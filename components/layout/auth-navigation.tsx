"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  clearAuthSession,
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";

export function AuthNavigation() {
  const router = useRouter();

  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );

  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  function handleLogout() {
    clearAuthSession();
    router.push("/");
    router.refresh();
  }

  if (!user) {
    return (
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
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="hidden text-sm text-zinc-600 sm:inline">
        Hi, <strong className="text-zinc-900">{user.firstName}</strong>
      </span>

      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
      >
        Log out
      </button>
    </div>
  );
}