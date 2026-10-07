import Link from "next/link";

export function WorkspaceMessage({ title, message, href = "/", action = "Return home" }: {
  title: string; message: string; href?: string; action?: string;
}) {
  return <section className="flex flex-1 items-center justify-center bg-brand-soft/60 px-4 py-16">
    <div className="workspace-card max-w-lg p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-panel-text">{title}</h1>
      <p className="mt-3 text-panel-muted">{message}</p>
      <Link href={href} className="workspace-button workspace-button-primary mt-6">{action}</Link>
    </div>
  </section>;
}
