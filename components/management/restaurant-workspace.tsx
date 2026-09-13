"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { CategoryManager } from "@/components/management/category-manager";
import { ImageManager } from "@/components/management/image-manager";
import { MenuManager } from "@/components/management/menu-manager";
import { ApiError } from "@/lib/api-client";
import {
  getAuthSessionSnapshot,
  getAuthToken,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";
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
  const storedUser = useSyncExternalStore(
    subscribeToAuthSession,
    getAuthSessionSnapshot,
    getServerAuthSessionSnapshot,
  );
  const user = useMemo(() => parseStoredUser(storedUser), [storedUser]);

  const [data, setData] = useState<WorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

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
    return <WorkspaceMessage title="Login required" message="Log in with an owner or administrator account to manage this restaurant." />;
  }

  if (!hasManagementRole) {
    return <WorkspaceMessage title="Access restricted" message="Your account role cannot manage restaurants." />;
  }

  if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
    return <WorkspaceMessage title="Invalid restaurant" message="The restaurant ID in this link is invalid." />;
  }

  if (isLoading) {
    return <WorkspaceMessage title="Loading restaurant" message="Preparing the management workspace..." />;
  }

  if (!data) {
    return <WorkspaceMessage title="Restaurant unavailable" message={loadError || "The restaurant could not be loaded."} />;
  }

  const canManage =
    user.role === "ADMIN" || data.restaurant.ownerId === user.id;

  if (!canManage) {
    return <WorkspaceMessage title="Access restricted" message="You can only manage restaurants that belong to your account." />;
  }

  const token = getAuthToken();
  if (!token) {
    return <WorkspaceMessage title="Session expired" message="Please log in again to continue." />;
  }

  return (
    <section className="flex-1 bg-gradient-to-b from-orange-50/70 to-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/manage/restaurants" className="font-semibold text-orange-600 hover:text-orange-700">
          ← Back to restaurant management
        </Link>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-600">
            Management workspace
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
            {data.restaurant.name}
          </h1>
          <p className="mt-3 text-zinc-600">
            Manage categories, menu items, availability, and image links.
          </p>
        </div>

        {loadError ? (
          <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        ) : null}

        <div className="mt-8 space-y-8">
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

          <MenuManager
            key={`menu-${data.menuCategories.length}-${data.menuItems.length}`}
            restaurantId={restaurantId}
            menuCategories={data.menuCategories}
            menuItems={data.menuItems}
            token={token}
            onChanged={refreshWorkspace}
          />

          <ImageManager
            key={`images-${data.restaurant.images.length}`}
            restaurantId={restaurantId}
            images={data.restaurant.images}
            token={token}
            onChanged={refreshWorkspace}
          />
        </div>
      </div>
    </section>
  );
}

function WorkspaceMessage({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <section className="flex flex-1 items-center justify-center bg-orange-50/60 px-4 py-16">
      <div className="max-w-lg rounded-3xl border border-orange-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold text-zinc-950">{title}</h1>
        <p className="mt-3 text-zinc-600">{message}</p>
        <Link href="/manage/restaurants" className="mt-6 inline-flex font-semibold text-orange-600">
          Return to management
        </Link>
      </div>
    </section>
  );
}
