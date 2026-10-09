import { beforeEach, describe, expect, it, vi } from "vitest";
import { getOwners, setRestaurantOwner, setRestaurantStatus, saveUser } from "@/services/admin-service";
const mocks = vi.hoisted(() => ({ request: vi.fn(), envelope: vi.fn() }));
vi.mock("@/lib/api-client", () => ({ apiRequest: mocks.request, apiRequestEnvelope: mocks.envelope }));
beforeEach(() => { vi.clearAllMocks(); });
describe("admin management contracts", () => {
  it("finds eligible owners beyond the first page and excludes inactive accounts and roles", async () => {
    mocks.envelope.mockResolvedValueOnce({ data: [{ id: 1, isActive: false, role: { isActive: true, roleName: "RESTAURANT_OWNER" } }, { id: 2, isActive: true, role: { isActive: false, roleName: "RESTAURANT_OWNER" } }, { id: 3, isActive: true, role: { isActive: true, roleName: "CUSTOMER" } }], pagination: { total: 101 } }).mockResolvedValueOnce({ data: [{ id: 101, isActive: true, role: { isActive: true, roleName: "RESTAURANT_OWNER" } }], pagination: { total: 101 } });
    expect((await getOwners("token")).map(user => user.id)).toEqual([101]);
    expect(mocks.envelope).toHaveBeenLastCalledWith("/admin/users?page=2&limit=100", { token: "token" });
  });
  it("uses dedicated ownership and status endpoints", async () => {
    await setRestaurantOwner("token", 4, 12);
    expect(mocks.request).toHaveBeenCalledWith("/admin/restaurants/4/owner", { token: "token", method: "PATCH", body: '{"ownerId":12}' });
    await setRestaurantStatus("token", 4, "INACTIVE");
    expect(mocks.request).toHaveBeenLastCalledWith("/admin/restaurants/4/status", { token: "token", method: "PATCH", body: '{"status":"INACTIVE"}' });
  });
  it("updates users without sending a password", async () => {
    const input = { firstName: "Test", lastName: "Owner", email: "owner@example.com", role: "RESTAURANT_OWNER" as const, isActive: true };
    await saveUser("token", input, 12);
    expect(mocks.request).toHaveBeenCalledWith("/admin/users/12", { token: "token", method: "PATCH", body: JSON.stringify(input) });
  });
});
