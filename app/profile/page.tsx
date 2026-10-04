import type { Metadata } from "next";

import { ProfileDashboard } from "@/components/auth/profile-dashboard";
import { RouteGuard } from "@/components/auth/route-guard";

export const metadata: Metadata = {
  title: "My profile",
  description: "View your DineRate account information.",
};

export default function ProfilePage() {
  return (
    <RouteGuard
      allowedRoles={["CUSTOMER", "RESTAURANT_OWNER", "MODERATOR", "ADMIN"]}
      returnPath="/profile"
    >
      <ProfileDashboard />
    </RouteGuard>
  );
}
