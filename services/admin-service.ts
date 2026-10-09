import { apiRequest, apiRequestEnvelope } from "@/lib/api-client";
import type { UserRole } from "@/types/auth";
import type { RestaurantRecord, RestaurantImage, MenuCategory, MenuItem } from "@/types/restaurant";
export interface AdminRole { id: number; roleName: UserRole; isActive: boolean }
export interface AdminUser { id: number; firstName: string; lastName: string; email: string; isActive: boolean; role: AdminRole }
export interface AdminRestaurant extends RestaurantRecord { owner?: AdminUser; images?: RestaurantImage[]; menuCategories?: MenuCategory[]; menuItems?: MenuItem[] }
export interface UserInput { firstName: string; lastName: string; email: string; role: UserRole; password?: string; isActive?: boolean }
export function getRoles(token: string) { return apiRequest<AdminRole[]>("/admin/roles", { token }); }
export function getAdminUsers(token: string, page = 1, limit = 10) { return apiRequestEnvelope<AdminUser[]>(`/admin/users?page=${page}&limit=${limit}`, { token }); }
export async function getOwners(token: string) {
  const owners: AdminUser[] = [];
  for (let page = 1; ; page++) {
    const result = await getAdminUsers(token, page, 100);
    owners.push(...result.data.filter(user => user.isActive && user.role.isActive && user.role.roleName === "RESTAURANT_OWNER"));
    if (page * 100 >= (result.pagination?.total ?? result.data.length)) return owners;
  }
}
export function saveUser(token: string, input: UserInput, id?: number) { return apiRequest<AdminUser>(id ? `/admin/users/${id}` : "/admin/users", { token, method: id ? "PATCH" : "POST", body: JSON.stringify(input) }); }
export function getAdminRestaurants(token: string, page = 1, limit = 10) { return apiRequestEnvelope<AdminRestaurant[]>(`/admin/restaurants?page=${page}&limit=${limit}`, { token }); }
export function getAssignedRestaurants(token: string) { return apiRequest<AdminRestaurant[]>("/me/restaurants", { token }); }
export function getOverview(token: string) { return apiRequest<{ users: number; restaurants: number; reviews: number; comments: number }>("/admin/overview", { token }); }
export function setRestaurantOwner(token: string, id: number, ownerId: number) { return apiRequest(`/admin/restaurants/${id}/owner`, { token, method: "PATCH", body: JSON.stringify({ ownerId }) }); }
export function setRestaurantStatus(token: string, id: number, status: "ACTIVE" | "INACTIVE") { return apiRequest(`/admin/restaurants/${id}/status`, { token, method: "PATCH", body: JSON.stringify({ status }) }); }
