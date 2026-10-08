"use client";

import { useEffect } from "react";
import Link from "next/link";

interface AppErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function AppError({ error, retry }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex flex-1 items-center justify-center bg-gradient-to-b from-red-50/60 to-white px-4 py-20">
      <div className="w-full max-w-xl rounded-3xl border border-red-100 bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-red-100 text-3xl font-bold text-red-600">
          !
        </span>
        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
          Unexpected error
        </p>
        <h1 className="mt-3 text-3xl font-bold text-zinc-950">
          Something went wrong
        </h1>
        <p className="mt-4 leading-7 text-zinc-600">
          The page could not be displayed. Try loading it again or return to the home page.
        </p>
        {error.digest ? (
          <p className="mt-3 text-xs text-zinc-400">Error reference: {error.digest}</p>
        ) : null}
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={retry}
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-xl border border-zinc-200 px-6 py-3 font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Return home
          </Link>
        </div>
      </div>
    </section>
  );
}
