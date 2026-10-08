"use client";

import { useAuthUser } from "@/hooks/use-auth-user";
import { PageSkeleton } from "@/components/ui/loading-layouts";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ApiError } from "@/lib/api-client";
import {
  clearAuthSession,
  getAuthToken,
  storeAuthUser,
} from "@/lib/auth-storage";
import { getCurrentUser } from "@/services/auth-service";
import type { AuthUser, UserRole } from "@/types/auth";

type LoadStatus = "loading" | "success" | "error";

const roleLabels: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  RESTAURANT_OWNER: "Restaurant owner",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

export function ProfileDashboard() {
  const router = useRouter();
  const authUser = useAuthUser();
  const [profile, setProfile] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let isCancelled = false;

    async function loadProfile() {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login?next=%2Fprofile");
        return;
      }

      try {
        const user = await getCurrentUser(token);

        if (!isCancelled && getAuthToken() === token) {
          storeAuthUser(user);
          setProfile(user);
          setStatus("success");
        }
      } catch (error) {
        if (isCancelled || getAuthToken() !== token) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearAuthSession();
          router.replace("/login?next=%2Fprofile");
          return;
        }

        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "Unable to load your profile. Please try again.",
        );
        setStatus("error");
      }
    }

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [authUser?.id, requestKey, router]);

  function retry() {
    setErrorMessage("");
    setStatus("loading");
    setRequestKey((current) => current + 1);
  }

  if (status === "loading" || (profile && profile.id !== authUser?.id)) {
    return <PageSkeleton variant="profile" />;
  }

  if (status === "error" || !profile) {
    return (
      <section className="flex flex-1 items-center justify-center bg-red-50/40 px-4 py-20">
        <div className="w-full max-w-lg rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-100 text-2xl font-bold text-red-600">
            !
          </span>
          <h1 className="mt-6 text-2xl font-bold text-zinc-950">
            Profile unavailable
          </h1>
          <p className="mt-3 text-red-700">{errorMessage}</p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`;

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-lg">
          <div className="bg-gradient-to-r from-orange-500 to-amber-400 px-6 py-10 sm:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/40 bg-white text-3xl font-bold text-orange-600 shadow-lg">
                {initials.toUpperCase()}
              </span>
              <div className="text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
                  DineRate account
                </p>
                <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
                  {profile.firstName} {profile.lastName}
                </h1>
                <p className="mt-2 text-orange-50">{roleLabels[profile.role]}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
                Account details
              </p>
              <dl className="mt-6 divide-y divide-zinc-100 rounded-2xl border border-zinc-100">
                <div className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <dt className="text-sm font-semibold text-zinc-500">Full name</dt>
                  <dd className="mt-1 font-semibold text-zinc-950 sm:mt-0">
                    {profile.firstName} {profile.lastName}
                  </dd>
                </div>
                <div className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <dt className="text-sm font-semibold text-zinc-500">Email address</dt>
                  <dd className="mt-1 break-all font-semibold text-zinc-950 sm:mt-0">
                    {profile.email}
                  </dd>
                </div>
                <div className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <dt className="text-sm font-semibold text-zinc-500">Account role</dt>
                  <dd className="mt-1 sm:mt-0">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
                      {roleLabels[profile.role]}
                    </span>
                  </dd>
                </div>
                <div className="p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
                  <dt className="text-sm font-semibold text-zinc-500">Account ID</dt>
                  <dd className="mt-1 font-mono text-sm text-zinc-700 sm:mt-0">
                    #{profile.id}
                  </dd>
                </div>
              </dl>
            </div>

            <aside className="rounded-2xl bg-orange-50 p-6">
              <h2 className="text-xl font-bold text-zinc-950">Quick actions</h2>
              <div className="mt-5 flex flex-col gap-3">
                <Link
                  href="/restaurants"
                  className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-800 shadow-sm hover:text-orange-600"
                >
                  Browse restaurants →
                </Link>
                <Link
                  href="/menu"
                  className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-800 shadow-sm hover:text-orange-600"
                >
                  Explore menus →
                </Link>
                {profile.role === "RESTAURANT_OWNER" || profile.role === "ADMIN" ? (
                  <Link
                    href="/manage/restaurants"
                    className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-800 shadow-sm hover:text-orange-600"
                  >
                    Manage restaurants →
                  </Link>
                ) : null}
                {profile.role === "MODERATOR" || profile.role === "ADMIN" ? (
                  <Link
                    href="/moderation"
                    className="rounded-xl bg-white px-4 py-3 font-semibold text-zinc-800 shadow-sm hover:text-orange-600"
                  >
                    Open moderation →
                  </Link>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
