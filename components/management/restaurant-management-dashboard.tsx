"use client";

import { TableSkeleton } from "@/components/ui/loading-layouts";
import { useEffect, useState } from "react";
import Link from "next/link";

import { ApiError } from "@/lib/api-client";
import { getAuthToken } from "@/lib/auth-storage";
import { useAuthUser } from "@/hooks/use-auth-user";
import {
  createRestaurant,
  updateRestaurant,
} from "@/services/restaurant-management-service";
import { getAdminRestaurants, getAssignedRestaurants, getOwners, setRestaurantOwner, setRestaurantStatus, type AdminRestaurant, type AdminUser } from "@/services/admin-service";
import type {
  CreateRestaurantInput,
  RestaurantRecord,
} from "@/types/restaurant";

import { WorkspaceToast } from "@/components/workspace/workspace-toast";
import { WorkspaceMessage } from "@/components/workspace/workspace-message";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
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

async function fetchManagedRestaurants(isAdmin: boolean) {
  const token = getAuthToken();
  if (!token) throw new ApiError("Please log in again.", 401);
  if (!isAdmin) return { restaurants: await getAssignedRestaurants(token) };
  const restaurants: AdminRestaurant[] = [];
  for (let page = 1; ; page++) {
    const result = await getAdminRestaurants(token, page, 100);
    restaurants.push(...result.data);
    if (page * 100 >= (result.pagination?.total ?? result.data.length)) return { restaurants };
  }
}

export function RestaurantManagementDashboard() {
  const user = useAuthUser();


  const [owners, setOwners] = useState<AdminUser[]>([]);
  const [control, setControl] = useState<AdminRestaurant | null>(null);
  const [ownerId, setOwnerId] = useState("");
  const [controlError, setControlError] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [formBusy, setFormBusy] = useState(false);
  const [restaurants, setRestaurants] = useState<AdminRestaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<RestaurantRecord | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (user?.role !== "ADMIN") return;
    const token = getAuthToken(); if (!token) return;
    let active = true;
    getOwners(token).then(result => { if (active) setOwners(result); }).catch(error => { if (active) setErrorMessage(getErrorMessage(error)); });
    return () => { active = false; };
  }, [user]);
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

    void fetchManagedRestaurants(user.role === "ADMIN")
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

    const result = await fetchManagedRestaurants(user.role === "ADMIN");

    setRestaurants(
      user.role === "ADMIN"
        ? result.restaurants
        : result.restaurants.filter(
            (restaurant) => restaurant.ownerId === user.id,
          ),
    );
  }

    async function changeControl(kind: "owner" | "status") {
    const token = getAuthToken(); if (!token || !control || isSubmitting) return;
    setIsSubmitting(true); setControlError("");
    try {
      if (kind === "owner") await setRestaurantOwner(token, control.id, Number(ownerId));
      else await setRestaurantStatus(token, control.id, control.status === "ACTIVE" ? "INACTIVE" : "ACTIVE");
      await reloadRestaurants(); setControl(null); setSuccessMessage("Restaurant updated successfully.");
    } catch (e) { setControlError(getErrorMessage(e)); } finally { setIsSubmitting(false); }
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
      return id ? await updateRestaurant(id, input, token) : await createRestaurant({ ...input, ownerId: Number(ownerId) }, token);
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
  function openCreate() { setOwnerId(""); setShowCreateForm(true); setSelectedRestaurant(null); setErrorMessage(""); setSuccessMessage(""); }
  function closeForm() { if (formBusy || isSubmitting) return; setShowCreateForm(false); setSelectedRestaurant(null); }

  return <>
    <WorkspaceShell label="Restaurant management content" sidebar={
      user.role === "ADMIN" ? <AdminSidebar active="restaurants" firstName={user.firstName} /> :
      <WorkspaceSidebar title="Restaurant management" identity={`Restaurant owner · ${user.firstName}`} navigation={
        <WorkspaceNavigation label="Restaurant management" active="restaurants" items={[
          { id: "restaurants", label: "Restaurants", href: "/manage/restaurants" },
        ]} />
      } />
    } footer={<Pagination label="Restaurant pagination" page={currentPage} total={filtered.length} onPageChange={setPage} loading={isLoading} />}>
      <WorkspaceHeader breadcrumb="Management / Restaurants" title="Restaurants" description="Manage restaurant details, menus, photos, and customer feedback." actions={
        <div className="flex gap-2"><button type="button" disabled={isLoading} onClick={async () => { setIsLoading(true); setErrorMessage(""); try { await reloadRestaurants(); } catch (error) { setErrorMessage(getErrorMessage(error)); } finally { setIsLoading(false); } }} className="workspace-button">Refresh</button>{user.role === "ADMIN" ? <button type="button" onClick={openCreate} className="workspace-button workspace-button-primary">Add restaurant</button> : null}</div>
      } />
      <label className="mt-6 block max-w-sm"><span className="sr-only">Search restaurants</span><input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} placeholder="Search restaurant or city" className="workspace-input" /></label>
      {errorMessage ? <p role="alert" className="mt-4 rounded-2xl bg-danger-soft p-4 text-sm text-danger-text">{errorMessage}</p> : null}
      {successMessage ? <WorkspaceToast message={successMessage} onDismiss={() => setSuccessMessage("")} /> : null}
      <div className="workspace-card mt-5 overflow-hidden">
        <div className="flex justify-between border-b border-panel-border px-5 py-4"><h3 className="text-sm font-semibold">Restaurant profiles</h3><span className="text-xs text-panel-muted">{filtered.length} matching · {restaurants.length} total</span></div>
        {isLoading ? <TableSkeleton label="Loading restaurants" /> : !filtered.length ? <div className="p-8 text-center"><h3 className="font-semibold">{search ? "No matching restaurants" : "No restaurants to manage"}</h3><p className="mt-2 text-sm text-panel-muted">{search ? "Try another search." : "Assigned restaurants will appear here, including inactive restaurants."}</p></div> : <WorkspaceTable label="Restaurants" header={<tr><th className="px-5 py-3 font-medium">Restaurant</th><th className="px-4 py-3 font-medium">City</th><th className="hidden px-4 py-3 font-medium md:table-cell">Address</th><th className="sticky right-0 bg-panel-subtle px-4 py-3 text-right font-medium">Actions</th></tr>}>{pageItems.map(restaurant => <tr key={restaurant.id}>
            <td className="h-18 max-w-xs px-5 py-3"><Link href={user.role === "ADMIN" ? `/restaurants/${restaurant.id}` : `/manage/restaurants/${restaurant.id}`} className="block truncate font-semibold hover:text-brand-hover">{restaurant.name}</Link><span className="mt-1 block text-xs text-panel-muted">#{restaurant.id} · {restaurant.status}{restaurant.owner ? ` · ${restaurant.owner.firstName} ${restaurant.owner.lastName}` : ""}</span></td>
            <td className="px-4 py-3">{restaurant.city}</td><td className="hidden max-w-xs truncate px-4 py-3 text-panel-muted md:table-cell">{restaurant.address}</td>
            <td className="px-3 py-3"><div className="flex flex-wrap justify-end gap-2">
              {user.role === "RESTAURANT_OWNER" ? <Link href={`/manage/restaurants/${restaurant.id}`} className="workspace-button workspace-button-primary">Manage</Link> : <button className="workspace-button" onClick={() => { setControl(restaurant); setOwnerId(String(restaurant.ownerId)); setControlError(""); }}>Owner & status</button>}
              <button type="button" onClick={() => { setSelectedRestaurant(restaurant); setShowCreateForm(false); setErrorMessage(""); setSuccessMessage(""); }} className="workspace-button">Edit details</button>
              <Link href={`/restaurants/${restaurant.id}`} className="workspace-button">View</Link>
            </div></td>
          </tr>)}</WorkspaceTable>}
      </div>
    </WorkspaceShell>
    {control ? <WorkspaceDialog title={`Owner & status · ${control.name}`} busy={isSubmitting} onClose={() => setControl(null)}>
      <label className="block text-sm font-semibold">Assigned owner<select value={ownerId} onChange={event => setOwnerId(event.target.value)} disabled={isSubmitting} className="workspace-input mt-2"><option value="">Select an active owner</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.firstName} {owner.lastName} · {owner.email}</option>)}</select></label>
      <div className="mt-5 flex flex-wrap gap-3"><button disabled={isSubmitting || !ownerId || Number(ownerId) === control.ownerId} className="workspace-button workspace-button-primary" onClick={() => void changeControl("owner")}>Save owner</button><button disabled={isSubmitting} className="workspace-button" onClick={() => void changeControl("status")}>{control.status === "ACTIVE" ? "Deactivate restaurant" : "Activate restaurant"}</button></div><p className="mt-4 text-sm text-panel-muted">Current status: {control.status}. Inactive restaurants are hidden from public browsing.</p>{controlError ? <p role="alert" className="mt-4 text-danger-text">{controlError}</p> : null}
    </WorkspaceDialog> : null}
    {showCreateForm || selectedRestaurant ? <WorkspaceDialog title={selectedRestaurant ? "Edit restaurant" : "Add restaurant"} busy={formBusy || isSubmitting} onClose={closeForm}>
      {showCreateForm ? <label className="mb-5 block text-sm font-semibold">Restaurant owner<select required value={ownerId} onChange={event => setOwnerId(event.target.value)} className="workspace-input mt-2"><option value="">Select an active owner</option>{owners.map(owner => <option key={owner.id} value={owner.id}>{owner.firstName} {owner.lastName} · {owner.email}</option>)}</select><span className="mt-2 block text-xs text-panel-muted">Create an owner account in Users & roles if none is available.</span></label> : null}
      <RestaurantForm key={selectedRestaurant?.id ?? "new"} restaurant={selectedRestaurant ?? undefined} allowImages={user.role === "RESTAURANT_OWNER"} canSubmit={!showCreateForm || Boolean(ownerId)} isSubmitting={isSubmitting} onSubmit={handleSave} token={getAuthToken() ?? ""} onSaved={handleSaved} onBusy={setFormBusy} images={restaurants.find(item => item.id === selectedRestaurant?.id)?.images ?? []} />
    </WorkspaceDialog> : null}
  </>;
}
