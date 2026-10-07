"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

export function WorkspaceDialog({ title, busy, onClose, children, footer }: {
  title: string; busy: boolean; onClose: () => void; children: ReactNode; footer?: ReactNode;
}) {
  const titleId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="workspace-dialog m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-hidden rounded-3xl border border-panel-border bg-panel-surface p-0 text-panel-text shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
    <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-panel-border px-6 py-4">
        <h2 id={titleId} className="text-lg font-bold">{title}</h2>
        <button type="button" disabled={busy} aria-label="Close dialog" onClick={onClose} className="flex size-10 items-center justify-center text-xl text-panel-muted hover:bg-stone-100 disabled:opacity-50">×</button>
      </header>
      <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6">{children}</div>
      {footer ? <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-panel-border bg-panel-subtle px-6 py-4">{footer}</footer> : null}
    </div>
  </dialog>;
}
