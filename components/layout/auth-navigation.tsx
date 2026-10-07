"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { clearAuthSession } from "@/lib/auth-storage";
import { useAuthSession } from "@/hooks/use-auth-user";
import { Skeleton } from "@/components/ui/skeleton";

interface AuthNavigationProps {
  mobile?: boolean;
  onNavigate?: () => void;
}

export function AuthNavigation({
  mobile = false,
  onNavigate,
}: AuthNavigationProps) {
  const router = useRouter();

  const { user, ready } = useAuthSession();

  function handleLogout() {
    clearAuthSession();
    onNavigate?.();
    router.push("/");
  }

  if (!ready) return <div aria-busy="true" aria-label="Loading account" className="flex gap-3"><Skeleton className="h-9 w-20 rounded-full" /><Skeleton className="h-9 w-24 rounded-full" /></div>;

  if (!user) {
    return (
      <div className={mobile ? "grid grid-cols-2 gap-3" : "flex items-center gap-3"}>
        <Link
          href="/login"
          onClick={onNavigate}
          className={
            mobile
              ? "inline-flex items-center justify-center rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              : "inline-flex rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-orange-50"
          }
        >
          Log in
        </Link>

        <Link
          href="/register"
          onClick={onNavigate}
          className={
            mobile
              ? "inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-600"
              : "inline-flex rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600"
          }
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-3"}>
      {mobile ? (
        <p className="px-4 pb-2 text-sm text-zinc-600">
          Signed in as <strong className="text-zinc-900">{user.firstName}</strong>
        </p>
      ) : null}

      <Link
        href="/profile"
        onClick={onNavigate}
        className={
          mobile
            ? "rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-orange-600"
            : "inline-flex rounded-full px-4 py-2 text-sm font-semibold text-zinc-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
        }
      >
        My profile
      </Link>

      {user.role === "RESTAURANT_OWNER" || user.role === "ADMIN" ? (
        <Link
          href="/manage/restaurants"
          onClick={onNavigate}
          className={
            mobile
              ? "rounded-xl px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
              : "inline-flex rounded-full px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
          }
        >
          Manage
        </Link>
      ) : null}

      {user.role === "MODERATOR" || user.role === "ADMIN" ? (
        <Link
          href="/moderation"
          onClick={onNavigate}
          className={
            mobile
              ? "rounded-xl px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
              : "inline-flex rounded-full px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
          }
        >
          Moderation
        </Link>
      ) : null}

      {!mobile ? (
        <span className="text-sm text-zinc-600">
          Hi, <strong className="text-zinc-900">{user.firstName}</strong>
        </span>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        className={
          mobile
            ? "inline-flex items-center justify-center rounded-xl border border-orange-200 px-4 py-3 text-sm font-semibold text-orange-600 hover:bg-orange-50"
            : "inline-flex rounded-full border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-600 transition-colors hover:bg-orange-50"
        }
      >
        Log out
      </button>
    </div>
  );
}
