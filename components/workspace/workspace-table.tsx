import type { ReactNode } from "react";

export function WorkspaceTable({ label, header, children }: {
  label: string; header: ReactNode; children: ReactNode;
}) {
  return <div className="overflow-x-auto"><table aria-label={label} className="workspace-table">
    <thead>{header}</thead><tbody>{children}
    </tbody>
  </table></div>;
}
