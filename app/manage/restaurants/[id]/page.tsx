import type { Metadata } from "next";

import { RouteGuard } from "@/components/auth/route-guard";
import { RestaurantWorkspace } from "@/components/management/restaurant-workspace";

export const metadata: Metadata = {
  title: "Manage restaurant",
  description: "Manage restaurant categories, menu items, and images.",
};

interface ManageRestaurantPageProps {
  params: Promise<{ id: string }>;
}

export default async function ManageRestaurantPage({
  params,
}: ManageRestaurantPageProps) {
  const { id } = await params;

  return (
    <RouteGuard
      allowedRoles={["RESTAURANT_OWNER", "ADMIN"]}
      returnPath={`/manage/restaurants/${id}`}
    >
      <RestaurantWorkspace restaurantId={Number(id)} />
    </RouteGuard>
  );
}
