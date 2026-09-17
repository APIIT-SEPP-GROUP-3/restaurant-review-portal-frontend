import type { Metadata } from "next";

import { RouteGuard } from "@/components/auth/route-guard";
import { RestaurantManagementDashboard } from "@/components/management/restaurant-management-dashboard";

export const metadata: Metadata = {
  title: "Restaurant management",
  description: "Create and manage restaurant profiles on DineRate.",
};

export default function RestaurantManagementPage() {
  return (
    <RouteGuard
      allowedRoles={["RESTAURANT_OWNER", "ADMIN"]}
      returnPath="/manage/restaurants"
    >
      <RestaurantManagementDashboard />
    </RouteGuard>
  );
}
