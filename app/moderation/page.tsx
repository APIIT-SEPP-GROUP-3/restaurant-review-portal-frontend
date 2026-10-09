import type { Metadata } from "next";

import { RouteGuard } from "@/components/auth/route-guard";
import { ModerationDashboard } from "@/components/moderation/moderation-dashboard";

export const metadata: Metadata = {
  title: "Content moderation",
  description: "Review and moderate DineRate community submissions.",
};

export default async function ModerationPage({ searchParams }: { searchParams: Promise<{ queue?: string }> }) {
  const { queue } = await searchParams;
  const initialQueue = queue === "comments" ? "comments" : "reviews";
  return (
    <RouteGuard
      allowedRoles={["MODERATOR"]}
      returnPath="/moderation"
    >
      <ModerationDashboard key={initialQueue} initialQueue={initialQueue} />
    </RouteGuard>
  );
}
