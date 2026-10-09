import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RouteGuard } from "@/components/auth/route-guard";
import type { AuthUser, UserRole } from "@/types/auth";

const mocks = vi.hoisted(() => ({ replace: vi.fn(), session: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));
vi.mock("@/hooks/use-auth-user", () => ({ useAuthSession: mocks.session }));
const user: AuthUser = { id: 1, firstName: "Test", lastName: "User", email: "test@example.com", role: "CUSTOMER" };
beforeEach(() => mocks.session.mockReturnValue({ user, ready: true }));

function renderGuard(roles: UserRole[] = ["MODERATOR"]) {
  render(<RouteGuard allowedRoles={roles} returnPath="/moderation"><p>Protected content</p></RouteGuard>);
}
describe("role-based route guard", () => {
  it.each(["MODERATOR"] as const)("allows %s to view moderation", (role) => {
    mocks.session.mockReturnValue({ user: { ...user, role }, ready: true });
    renderGuard();
    expect(screen.getByText("Protected content")).toBeDefined();
  });
  it.each(["CUSTOMER", "RESTAURANT_OWNER", "ADMIN"] as const)("denies %s access to moderation", (role) => {
    mocks.session.mockReturnValue({ user: { ...user, role }, ready: true });
    renderGuard();
    expect(screen.getByText("Access denied")).toBeDefined();
    expect(screen.queryByText("Protected content")).toBeNull();
  });
  it("redirects a signed-out visitor to login with a return path", async () => {
    mocks.session.mockReturnValue({ user: null, ready: true });
    renderGuard();
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/login?next=%2Fmoderation"));
    expect(screen.queryByText("Protected content")).toBeNull();
  });
  it("does not redirect before the session is ready", () => {
    mocks.session.mockReturnValue({ user: null, ready: false });
    renderGuard();
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(screen.queryByText("Protected content")).toBeNull();
  });
});
