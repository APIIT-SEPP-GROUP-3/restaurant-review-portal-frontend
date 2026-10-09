"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuthSession } from "@/hooks/use-auth-user";
import { PageSkeleton, WorkspaceSkeleton } from "@/components/ui/loading-layouts";
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
  const { user, ready } = useAuthSession();

  useEffect(() => {
    if (ready && !user) {
      router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
    }
  }, [ready, returnPath, router, user]);

  if (!ready || !user) {
    return returnPath.startsWith("/manage") || returnPath.startsWith("/moderation") || returnPath === "/admin" || returnPath === "/my-reviews" ?
      <WorkspaceSkeleton title={returnPath.startsWith("/moderation") || returnPath === "/admin" || returnPath === "/my-reviews" ? "Content moderation" : "Restaurant management"} /> : <PageSkeleton variant="profile" />;
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
