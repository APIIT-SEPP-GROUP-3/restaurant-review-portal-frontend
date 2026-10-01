"use client";

import { useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
import type { UserRole } from "@/types/auth";

interface RouteGuardProps {
  allowedRoles: UserRole[];
  returnPath: string;
  children: ReactNode;
}

export function RouteGuard({
  allowedRoles,
  returnPath,
  children,
}: RouteGuardProps) {
  const router = useRouter();
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );
  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
    }
  }, [returnPath, router, user]);

  if (!user) {
    return (
      <section className="flex flex-1 items-center justify-center bg-orange-50/40 px-4 py-20">
        <div className="text-center" role="status">
          <span className="mx-auto block size-12 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
          <p className="mt-4 font-semibold text-zinc-700">
            Checking your account access...
          </p>
        </div>
      </section>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-orange-50/70 to-white px-4 py-20">
        <div className="w-full max-w-xl rounded-3xl border border-orange-100 bg-white p-10 text-center shadow-sm">
          <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-orange-100 text-3xl font-bold text-orange-600">
            !
          </span>
          <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Access denied
          </p>
          <h1 className="mt-3 text-3xl font-bold text-zinc-950">
            Your account cannot open this page
          </h1>
          <p className="mt-4 leading-7 text-zinc-600">
            This area is only available to authorized DineRate team members or
            restaurant owners.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
            >
              Return home
            </Link>
            <Link
              href="/restaurants"
              className="rounded-xl border border-orange-200 px-6 py-3 font-semibold text-orange-600 hover:bg-orange-50"
            >
              Browse restaurants
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return children;
}
