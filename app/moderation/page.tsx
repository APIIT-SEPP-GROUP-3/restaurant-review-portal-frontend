import type { Metadata } from "next";

import { ModerationDashboard } from "@/components/moderation/moderation-dashboard";

export const metadata: Metadata = {
  title: "Content moderation",
  description: "Review and moderate DineRate community submissions.",
};

export default function ModerationPage() {
  return <ModerationDashboard />;
}
