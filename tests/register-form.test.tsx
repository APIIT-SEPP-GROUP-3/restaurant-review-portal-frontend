import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RegisterForm } from "@/components/auth/register-form";
import { ApiError } from "@/lib/api-client";

const mocks = vi.hoisted(() => ({ push: vi.fn(), register: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/services/auth-service", () => ({ registerUser: mocks.register }));
function fillAndSubmit(confirmPassword = "TestPassword123") {
  render(<RegisterForm />);
  fireEvent.change(screen.getByLabelText("First name"), { target: { value: " Test " } });
  fireEvent.change(screen.getByLabelText("Last name"), { target: { value: " User " } });
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "TestPassword123" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: confirmPassword } });
  fireEvent.submit(screen.getByRole("button", { name: "Create account" }).closest("form")!);
}
describe("registration form", () => {
  it("rejects mismatched passwords without calling the API", () => {
    fillAndSubmit("DifferentPassword123");
    expect(screen.getByRole("alert").textContent).toContain("Passwords do not match");
    expect(mocks.register).not.toHaveBeenCalled();
  });
  it("submits trimmed names and redirects to login", async () => {
    mocks.register.mockResolvedValueOnce({});
    fillAndSubmit();
    await waitFor(() => expect(mocks.push).toHaveBeenCalledWith("/login"));
    expect(mocks.register).toHaveBeenCalledWith({ firstName: "Test", lastName: "User", email: "test@example.com", password: "TestPassword123" });
  });
  it("shows API errors and allows another submission", async () => {
    mocks.register.mockRejectedValueOnce(new ApiError("Email already registered", 409));
    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole("alert").textContent).toContain("Email already registered"));
    expect((screen.getByRole("button", { name: "Create account" }) as HTMLButtonElement).disabled).toBe(false);
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
