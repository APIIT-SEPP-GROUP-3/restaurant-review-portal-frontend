"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { WorkspaceMessage } from "@/components/workspace/workspace-message";
import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { WorkspaceShell, WorkspaceSidebar, WorkspaceHeader } from "@/components/workspace/workspace-shell";

import { CustomerFeedback } from "@/components/management/customer-feedback";
import { CategoryManager } from "@/components/management/category-manager";
import { ImageManager } from "@/components/management/image-manager";
import { MenuManager } from "@/components/management/menu-manager";
import { ApiError } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  getMenuCategories,
  getMenuItems,
} from "@/services/restaurant-management-service";
import {
  getRestaurantById,
  getRestaurantCategories,
} from "@/services/restaurant-service";
import type {
  ManagedMenuItem,
  MenuCategory,
  RestaurantCategory,
  RestaurantDetail,
} from "@/types/restaurant";

interface RestaurantWorkspaceProps {
  restaurantId: number;
}

interface WorkspaceData {
  restaurant: RestaurantDetail;
  restaurantCategories: RestaurantCategory[];
  menuCategories: MenuCategory[];
  menuItems: ManagedMenuItem[];
}

async function fetchWorkspaceData(
  restaurantId: number,
): Promise<WorkspaceData> {
  const [restaurant, restaurantCategories, menuCategories, menuItems] =
    await Promise.all([
      getRestaurantById(restaurantId),
      getRestaurantCategories(),
      getMenuCategories(restaurantId),
      getMenuItems(restaurantId),
    ]);

  return {
    restaurant,
    restaurantCategories,
    menuCategories,
    menuItems,
  };
}

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to load the restaurant management workspace.";
}

export function RestaurantWorkspace({
  restaurantId,
}: RestaurantWorkspaceProps) {
  const user = useAuthUser();


  const [data, setData] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeSection, setActiveSection] = useState("menu");

  const hasManagementRole =
    user?.role === "RESTAURANT_OWNER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!hasManagementRole || !Number.isInteger(restaurantId) || restaurantId <= 0) {
      return;
    }

    let isActive = true;

    void fetchWorkspaceData(restaurantId)
      .then((workspaceData) => {
        if (isActive) {
          setData(workspaceData);
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setLoadError(errorMessage(error));
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [hasManagementRole, restaurantId]);

  async function refreshWorkspace() {
    try {
      setData(await fetchWorkspaceData(restaurantId));
      setLoadError("");
    } catch (error) {
      setLoadError(errorMessage(error));
    }
  }

  if (!user) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Login required" message="Log in with an owner or administrator account to manage this restaurant." />;
  }

  if (!hasManagementRole) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Access restricted" message="Your account role cannot manage restaurants." />;
  }

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Invalid restaurant" message="The restaurant ID in this link is invalid." />;
  }

  if (isLoading) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Loading restaurant" message="Preparing the management workspace..." />;
  }

  if (!data) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Restaurant unavailable" message={loadError || "The restaurant could not be loaded."} />;
  }

  const canManage =
    user.role === "ADMIN" || data.restaurant.ownerId === user.id;

  if (!canManage) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Access restricted" message="You can only manage restaurants that belong to your account." />;
  }

  const token = getAuthToken();
  if (!token) {
    return <WorkspaceMessage href="/manage/restaurants" action="Return to management" title="Session expired" message="Please log in again to continue." />;
  }

  return (
    <WorkspaceShell label="Restaurant workspace content" sidebar={
      <WorkspaceSidebar title="Manage restaurant" backLink={{ href: "/manage/restaurants", label: "Back to restaurants" }} navigation={
        <WorkspaceNavigation label="Restaurant management sections" active={activeSection} onSelect={setActiveSection} items={[
          { id: "menu", label: "Menu items & categories" },
          { id: "feedback", label: "Customer feedback" },
          { id: "images", label: "Restaurant photos" },
          { id: "categories", label: "Restaurant categories" },
        ]} />
      }>
        {user.role === "ADMIN" ? <Link href="/moderation" className="block text-sm text-white/60 hover:text-white">Content moderation ↗</Link> : null}
      </WorkspaceSidebar>
    }>
      <WorkspaceHeader title={data.restaurant.name} actions={<Link href={`/restaurants/${restaurantId}`} className="workspace-button">View public page ↗</Link>} />
        {loadError ? (
          <p role="alert" className="mt-6 rounded-xl border border-danger-border bg-danger-soft px-4 py-3 text-sm text-danger-text">
            {loadError}
          </p>
        ) : null}

        <div className="mt-6 space-y-8">
          {activeSection === "feedback" ? <CustomerFeedback key={restaurantId} restaurantId={restaurantId} /> : null}
          <div hidden={activeSection !== "categories"}>
          <CategoryManager
            key={`categories-${data.restaurant.updatedAt}-${data.restaurantCategories.length}`}
            restaurantId={restaurantId}
            categories={data.restaurantCategories}
            selectedCategoryIds={data.restaurant.categories.map(
              ({ categoryId }) => categoryId,
            )}
            token={token}
            isAdmin={user.role === "ADMIN"}
            onChanged={refreshWorkspace}
          />

          </div>
          <div hidden={activeSection !== "menu"}>
          <MenuManager
            restaurantId={restaurantId}
            menuCategories={data.menuCategories}
            menuItems={data.menuItems}
            token={token}
            onChanged={refreshWorkspace}
          />

          </div>
          <div hidden={activeSection !== "images"}>
          <ImageManager
            restaurantId={restaurantId}
            images={data.restaurant.images}
            token={token}
            onChanged={refreshWorkspace}
          />
          </div>
        </div>
    </WorkspaceShell>
  );
}
