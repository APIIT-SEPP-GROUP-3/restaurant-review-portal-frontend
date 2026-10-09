"use client";

import { NavigationLink } from "@/components/layout/navigation-link";
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
        <NavigationLink href="/login" mobile={mobile} onNavigate={onNavigate}>
          Log in
        </NavigationLink>

        <NavigationLink href="/register" mobile={mobile} onNavigate={onNavigate}>
          Sign up
        </NavigationLink>
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

      <NavigationLink href="/profile" mobile={mobile} onNavigate={onNavigate}>
        My profile
      </NavigationLink>

      {user.role === "RESTAURANT_OWNER" || user.role === "ADMIN" ? (
        <NavigationLink href={user.role === "ADMIN" ? "/admin" : "/manage/restaurants"} activeHrefs={["/admin", "/manage/restaurants"]} mobile={mobile} onNavigate={onNavigate}>
          Manage
        </NavigationLink>
      ) : null}

      {user.role === "MODERATOR" ? (
        <NavigationLink href="/moderation" mobile={mobile} onNavigate={onNavigate}>
          Moderation
        </NavigationLink>
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
