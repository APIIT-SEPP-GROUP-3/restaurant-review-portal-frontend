import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { WorkspaceSidebar } from "@/components/workspace/workspace-shell";

export function ModerationSidebar({ active, firstName, onSelect, disabled = false }: {
  active: "reviews" | "comments" | "history";
  firstName: string;
  onSelect?: (queue: "reviews" | "comments") => void;
  disabled?: boolean;
}) {
  return <WorkspaceSidebar title="Content moderation" identity={`Moderator · ${firstName}`} navigation={
    <WorkspaceNavigation label="Moderation sections" active={active} disabled={disabled}
      onSelect={id => onSelect?.(id as "reviews" | "comments")}
      items={[
        { id: "reviews", label: "Customer reviews", ...(onSelect ? {} : { href: "/moderation" }) },
        { id: "comments", label: "Comments & replies", ...(onSelect ? {} : { href: "/moderation?queue=comments" }) },
        { id: "history", label: "Decision history", href: "/moderation/history" },
      ]}
    />
  } />;
}
