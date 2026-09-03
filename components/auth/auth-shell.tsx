import type { ReactNode } from "react";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  description: string;
  alternatePrompt: string;
  alternateLabel: string;
  alternateHref: string;
  children: ReactNode;
}

export function AuthShell({
  title,
  description,
  alternatePrompt,
  alternateLabel,
  alternateHref,
  children,
}: AuthShellProps) {
  return (
    <section className="flex flex-1 items-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-xl shadow-orange-100/60 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-amber-400 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-100">
              Welcome to DineRate
            </p>

            <h2 className="mt-5 text-4xl font-bold leading-tight">
              Find great food through honest experiences.
            </h2>

            <p className="mt-5 leading-7 text-orange-50">
              Explore restaurants, read genuine reviews, and share your own
              dining experiences with the community.
            </p>
          </div>

          <div className="mt-12 rounded-2xl bg-white/15 p-5 backdrop-blur">
            <p className="font-semibold">Your next favourite meal starts here.</p>
            <p className="mt-2 text-sm text-orange-50">
              One account gives you access to reviews, ratings, and restaurant
              discovery.
            </p>
          </div>

          <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-white/10" />
          <div className="absolute -right-10 top-16 size-32 rounded-full bg-amber-200/20" />
        </div>

        <div className="p-6 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <p className="text-sm font-semibold text-orange-600">
              DineRate account
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              {title}
            </h1>

            <p className="mt-3 leading-6 text-zinc-600">{description}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-zinc-600">
              {alternatePrompt}{" "}
              <Link
                href={alternateHref}
                className="font-semibold text-orange-600 hover:text-orange-700"
              >
                {alternateLabel}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}