import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AuthStorageError, clearAuthSession, getAuthSessionSnapshot, getAuthToken,
  parseStoredUser, storeAuthSession, subscribeToAuthSession,
} from "@/lib/auth-storage";
import { USER_ROLES, type AuthUser } from "@/types/auth";

const user: AuthUser = {
  id: 1, firstName: "Test", lastName: "Customer",
  email: "test@example.com", role: "CUSTOMER",
};
function token(exp: number) {
  return `header.${btoa(JSON.stringify({ exp }))}.signature`;
}
afterEach(() => vi.useRealTimers());

describe("authentication storage", () => {
  it("stores a session and clears it on logout", () => {
    const jwt = token(Math.floor(Date.now() / 1000) + 3600);
    storeAuthSession({ token: jwt, user });
    expect(getAuthToken()).toBe(jwt);
    expect(parseStoredUser(getAuthSessionSnapshot())).toEqual(user);
    clearAuthSession();
    expect(getAuthToken()).toBeNull();
    expect(getAuthSessionSnapshot()).toBeNull();
  });
  it("does not expose expired sessions", () => {
    storeAuthSession({ token: token(Math.floor(Date.now() / 1000) - 1), user });
    expect(getAuthToken()).toBeNull();
    expect(getAuthSessionSnapshot()).toBeNull();
  });
  it.each(USER_ROLES)("accepts the implemented %s role", (role) => {
    expect(parseStoredUser(JSON.stringify({ ...user, role }))).toEqual({ ...user, role });
  });
  it.each([null, "invalid JSON", "{}", JSON.stringify({ ...user, role: "UNKNOWN" }),
    JSON.stringify({ ...user, id: -1 })])("rejects invalid stored user %s", (value) => {
    expect(parseStoredUser(value)).toBeNull();
  });
  it("reports unavailable browser storage", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    expect(() => storeAuthSession({ token: "test-token", user })).toThrow(AuthStorageError);
  });
  it("notifies subscribers on changes and unsubscribes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuthSession(listener);
    storeAuthSession({ token: "test-token", user });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    clearAuthSession();
    expect(listener).toHaveBeenCalledTimes(1);
  });
  it("notifies subscribers when a token expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    storeAuthSession({ token: token(Date.now() / 1000 + 1), user });
    const listener = vi.fn();
    const unsubscribe = subscribeToAuthSession(listener);
    vi.advanceTimersByTime(1050);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getAuthSessionSnapshot()).toBeNull();
    unsubscribe();
  });
});
