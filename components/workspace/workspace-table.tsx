import type { ReactNode } from "react";

export function WorkspaceTable({ label, header, children, onRowClick }: {
  label: string; header: ReactNode; children: ReactNode; onRowClick?: (id: number) => void;
}) {
  return <div className="overflow-x-auto"><table aria-label={label} className="workspace-table" data-clickable-rows={Boolean(onRowClick)}>
    <thead>{header}</thead><tbody onClick={onRowClick ? event => {
      const target = event.target as HTMLElement;
      if (target.closest("button, a, input, select, textarea, label, summary")) return;
      const row = target.closest<HTMLTableRowElement>("tr[data-record-id]");
      const id = Number(row?.dataset.recordId);
      if (row && Number.isInteger(id)) onRowClick(id);
    } : undefined}>{children}
    </tbody>
  </table></div>;
}
