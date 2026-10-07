"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  createRestaurant,
  updateRestaurant,
} from "@/services/restaurant-management-service";
import { getRestaurants } from "@/services/restaurant-service";
import type {
  CreateRestaurantInput,
  RestaurantRecord,
  RestaurantSummary,
} from "@/types/restaurant";

import { WorkspaceToast } from "@/components/workspace/workspace-toast";
import { WorkspaceMessage } from "@/components/workspace/workspace-message";
import { WorkspaceNavigation } from "@/components/workspace/workspace-navigation";
import { WorkspaceShell, WorkspaceSidebar, WorkspaceHeader } from "@/components/workspace/workspace-shell";
import { WorkspaceDialog } from "@/components/workspace/workspace-dialog";
import { WorkspaceTable } from "@/components/workspace/workspace-table";
import { Pagination, WORKSPACE_PAGE_SIZE } from "@/components/workspace/pagination";

import { RestaurantForm } from "@/components/management/restaurant-form";

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Unable to complete the restaurant request.";
}

async function fetchManagedRestaurants() {
  const first = await getRestaurants({ page: 1, limit: 50, sortBy: "name", sortOrder: "asc" });
  const restaurants = [...first.restaurants];
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const result = await getRestaurants({ page, limit: 50, sortBy: "name", sortOrder: "asc" });
    restaurants.push(...result.restaurants);
  }
  return { restaurants, pagination: first.pagination };
}

export function RestaurantManagementDashboard() {
  const user = useAuthUser();


  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [restaurants, setRestaurants] = useState<RestaurantSummary[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!successMessage) return;
    const timer = window.setTimeout(() => setSuccessMessage(""), 6000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const canManage =
    user?.role === "RESTAURANT_OWNER" || user?.role === "ADMIN";

  useEffect(() => {
    if (!canManage || !user) {
      return;
    }

    let isActive = true;

    void fetchManagedRestaurants()
      .then((result) => {
        if (!isActive) {
          return;
        }

        setRestaurants(
          user.role === "ADMIN"
            ? result.restaurants
            : result.restaurants.filter(
                (restaurant) => restaurant.ownerId === user.id,
              ),
        );
      })
      .catch((error: unknown) => {
        if (isActive) {
          setErrorMessage(getErrorMessage(error));
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
  }, [canManage, user]);

  async function reloadRestaurants() {
    if (!user) {
      return;
    }

    const result = await fetchManagedRestaurants();

    setRestaurants(
      user.role === "ADMIN"
        ? result.restaurants
        : result.restaurants.filter(
            (restaurant) => restaurant.ownerId === user.id,
          ),
    );
  }

  async function handleSave(input: CreateRestaurantInput, savedId?: number): Promise<RestaurantRecord> {
    const token = getAuthToken();
    if (!token) {
      throw new ApiError("Your session has expired. Please log in again.", 401);
    }
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const id = selectedRestaurant?.id ?? savedId;
      return id ? await updateRestaurant(id, input, token) : await createRestaurant(input, token);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaved() {
    await reloadRestaurants();
    setShowCreateForm(false);
    setSelectedRestaurant(null);
    setSuccessMessage(selectedRestaurant ? "Restaurant updated successfully." : "Restaurant created successfully.");
  }

  if (!user) {
    return (
      <WorkspaceMessage
        title="Owner login required"
        message="Log in with a restaurant owner or administrator account to manage restaurants."
        href="/login" action="Log in"
      />
    );
  }

  if (!canManage) {
    return (
      <WorkspaceMessage
        title="Access restricted"
        message="Your account does not have permission to manage restaurants."
      />
    );
  }

  const filtered = restaurants.filter(restaurant => `${restaurant.name} ${restaurant.city}`.toLowerCase().includes(search.toLowerCase()));
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / WORKSPACE_PAGE_SIZE)));
  const pageItems = filtered.slice((currentPage - 1) * WORKSPACE_PAGE_SIZE, currentPage * WORKSPACE_PAGE_SIZE);
  function openCreate() { setShowCreateForm(true); setSelectedRestaurant(null); setErrorMessage(""); setSuccessMessage(""); }
  function closeForm() { if (formBusy || isSubmitting) return; setShowCreateForm(false); setSelectedRestaurant(null); }

  return <>
    <WorkspaceShell label="Restaurant management content" sidebar={
      <WorkspaceSidebar title="Restaurant management" identity={`${user.role === "ADMIN" ? "Administrator" : "Restaurant owner"} · ${user.firstName}`} navigation={
        <WorkspaceNavigation label="Restaurant management" active="restaurants" onSelect={openCreate} items={[
          { id: "restaurants", label: "Restaurants", href: "/manage/restaurants" }, { id: "create", label: "Add restaurant" },
        ]} />
      }>
        {user.role === "ADMIN" ? <Link href="/moderation" className="block text-sm text-white/60 hover:text-white">Content moderation ↗</Link> : null}
      </WorkspaceSidebar>
    } footer={<Pagination label="Restaurant pagination" page={currentPage} total={filtered.length} onPageChange={setPage} loading={isLoading} />}>
      <WorkspaceHeader breadcrumb="Management / Restaurants" title="Restaurants" description="Manage restaurant details, menus, photos, and customer feedback." actions={
        <div className="flex gap-2"><button type="button" disabled={isLoading} onClick={async () => { setIsLoading(true); setErrorMessage(""); try { await reloadRestaurants(); } catch (error) { setErrorMessage(getErrorMessage(error)); } finally { setIsLoading(false); } }} className="workspace-button">Refresh</button><button type="button" onClick={openCreate} className="workspace-button workspace-button-primary">Add restaurant</button></div>
      } />
      <label className="mt-6 block max-w-sm"><span className="sr-only">Search restaurants</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search restaurant or city" className="workspace-input" /></label>
      {errorMessage ? <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger-text">{errorMessage}</p> : null}
      {successMessage ? <WorkspaceToast message={successMessage} onDismiss={() => setSuccessMessage("")} /> : null}
      <div className="workspace-card mt-5 overflow-hidden">
        <div className="flex justify-between border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">Restaurant profiles</h3><span className="text-xs text-panel-muted">{filtered.length} matching · {restaurants.length} total</span></div>
        {isLoading ? <p role="status" className="p-8 text-center text-sm text-panel-muted">Loading restaurants...</p> : !filtered.length ? <div className="p-8 text-center"><h3 className="font-semibold">{search ? "No matching restaurants" : "No restaurants to manage"}</h3><p className="mt-2 text-sm text-panel-muted">{search ? "Try another search." : "Add a restaurant to start managing its menu and photos."}</p></div> : <WorkspaceTable label="Restaurants" header={<tr><th className="px-5 py-3 font-medium">Restaurant</th><th className="px-4 py-3 font-medium">City</th><th className="hidden px-4 py-3 font-medium md:table-cell">Address</th><th className="sticky right-0 bg-panel-subtle px-4 py-3 text-right font-medium">Actions</th></tr>}>{pageItems.map(restaurant => <tr key={restaurant.id}>
            <td className="h-18 max-w-xs px-5 py-3"><Link href={`/manage/restaurants/${restaurant.id}`} className="block truncate font-semibold hover:text-brand-hover">{restaurant.name}</Link><span className="mt-1 block text-xs text-panel-muted">#{restaurant.id}</span></td>
            <td className="px-4 py-3">{restaurant.city}</td><td className="hidden max-w-xs truncate px-4 py-3 text-panel-muted md:table-cell">{restaurant.address}</td>
            <td className="px-3 py-3"><div className="flex flex-wrap justify-end gap-2">
              <Link href={`/manage/restaurants/${restaurant.id}`} className="workspace-button workspace-button-primary">Manage</Link>
              <button type="button" onClick={() => { setSelectedRestaurant(restaurant); setShowCreateForm(false); setErrorMessage(""); setSuccessMessage(""); }} className="workspace-button">Edit details</button>
              <Link href={`/restaurants/${restaurant.id}`} className="workspace-button">View</Link>
            </div></td>
          </tr>)}</WorkspaceTable>}
      </div>
    </WorkspaceShell>
    {showCreateForm || selectedRestaurant ? <WorkspaceDialog title={selectedRestaurant ? "Edit restaurant" : "Add restaurant"} busy={formBusy || isSubmitting} onClose={closeForm}>
      <RestaurantForm key={selectedRestaurant?.id ?? "new"} restaurant={selectedRestaurant ?? undefined} isSubmitting={isSubmitting} onSubmit={handleSave} token={getAuthToken() ?? ""} onSaved={handleSaved} onBusy={setFormBusy} images={restaurants.find(item => item.id === selectedRestaurant?.id)?.images ?? []} />
    </WorkspaceDialog> : null}
  </>;
}
