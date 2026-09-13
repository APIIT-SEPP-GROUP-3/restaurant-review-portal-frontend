import type { Metadata } from "next";

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

  return <RestaurantWorkspace restaurantId={Number(id)} />;
}
