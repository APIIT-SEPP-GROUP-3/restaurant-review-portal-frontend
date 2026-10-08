import type { ReactNode } from "react";

export function WorkspaceToast({ message, onDismiss, action }: {
  message: string; onDismiss: () => void; action?: ReactNode;
}) {
  return <div role="status" aria-live="polite" className="workspace-toast">
    <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-success-soft">✓</span>
    <span>{message}</span>{action}
    <button type="button" aria-label="Dismiss notification" onClick={onDismiss} className="flex size-8 shrink-0 items-center justify-center text-lg text-panel-muted">×</button>
  </div>;
}
