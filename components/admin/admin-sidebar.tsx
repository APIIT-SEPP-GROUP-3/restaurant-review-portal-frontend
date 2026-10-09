import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { WorkspaceSidebar } from "@/components/workspace/workspace-shell";

export function AdminSidebar({ active, firstName }: {
  active: "users" | "restaurants";
  firstName: string;
}) {
  return (
    <WorkspaceSidebar
      title="Administration"
      identity={`Administrator · ${firstName}`}
      navigation={
        <WorkspaceNavigation
          label="Administration"
          active={active}
          items={[
            { id: "users", label: "Users & overview", href: "/admin" },
            { id: "restaurants", label: "Restaurants", href: "/manage/restaurants" },
          ]}
        />
      }
    />
  );
}
