"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function SubmissionDialog({ title, busy, onClose, children, footer }: {
  title: string; busy: boolean; onClose: () => void; children: ReactNode; footer: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby="submission-dialog-title" onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="submission-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white p-0 text-zinc-950 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-100 px-6 py-4">
        <h2 id="submission-dialog-title" className="text-lg font-bold">{title}</h2>
        <button type="button" disabled={busy} aria-label="Close submission" onClick={onClose} className="flex size-10 items-center justify-center text-xl text-zinc-500 hover:bg-stone-100 disabled:opacity-50">×</button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>
      {footer ? <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-stone-100 bg-stone-50 px-6 py-4">{footer}</footer> : null}
    </div>
  </dialog>;
}
