import type { Metadata } from "next";

import { RestaurantManagementDashboard } from "@/components/management/restaurant-management-dashboard";

export const metadata: Metadata = {
  title: "Restaurant management",
  description: "Create and manage restaurant profiles on DineRate.",
};

export default function RestaurantManagementPage() {
  return <RestaurantManagementDashboard />;
}
