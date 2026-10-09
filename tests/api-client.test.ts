import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken, storeAuthSession } from "@/lib/auth-storage";

const fetchMock = vi.fn<typeof fetch>();
beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "http://api.test/api/");
  vi.stubGlobal("fetch", fetchMock);
});
function response(body: unknown, status = 200) {
  fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));
}
describe("API client (mocked network)", () => {
  it("returns data and preserves pagination in the envelope", async () => {
    const { apiRequestEnvelope } = await import("@/lib/api-client");
    const payload = { success: true, data: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 0 } };
    response(payload);
    expect(await apiRequestEnvelope("/restaurants")).toEqual(payload);
    expect(fetchMock).toHaveBeenCalledWith("http://api.test/api/restaurants", expect.objectContaining({ cache: "no-store" }));
  });
  it("adds bearer authentication and disables authenticated caching", async () => {
    const { apiRequest } = await import("@/lib/api-client");
    response({ success: true, data: { id: 1 } });
    expect(await apiRequest("/auth/me", { token: "test-token", cache: "force-cache" })).toEqual({ id: 1 });
    const options = fetchMock.mock.calls[0][1];
    expect(options?.cache).toBe("no-store");
    expect(new Headers(options?.headers).get("Authorization")).toBe("Bearer test-token");
  });
  it("preserves custom request headers", async () => {
    const { apiRequest } = await import("@/lib/api-client");
    response({ success: true, data: null });
    await apiRequest("/example", { headers: { "Content-Type": "text/plain", "X-Test": "yes" } });
    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get("Content-Type")).toBe("text/plain");
    expect(headers.get("X-Test")).toBe("yes");
  });
  it("reports connection failures", async () => {
    const { apiRequest } = await import("@/lib/api-client");
    fetchMock.mockRejectedValueOnce(new TypeError("Network failed"));
    await expect(apiRequest("/restaurants")).rejects.toMatchObject({ name: "ApiError", status: 0 });
  });
  it("reports unreadable responses", async () => {
    const { apiRequest } = await import("@/lib/api-client");
    fetchMock.mockResolvedValueOnce(new Response("not JSON", { status: 502 }));
    await expect(apiRequest("/restaurants")).rejects.toMatchObject({ status: 502, message: "Unable to read the server response." });
  });
  it("shows backend validation errors", async () => {
    const { apiRequest } = await import("@/lib/api-client");
    response({ success: false, message: "Invalid input" }, 400);
    await expect(apiRequest("/reviews")).rejects.toMatchObject({ status: 400, message: "Invalid input" });
  });
  it.each(["active-token", "old-token"])("handles a 401 for %s without clearing a newer session", async (requestToken) => {
    storeAuthSession({ token: "active-token", user: { id: 1, firstName: "Test", lastName: "User", email: "test@example.com", role: "CUSTOMER" } });
    const { apiRequest } = await import("@/lib/api-client");
    response({ success: false, message: "Unauthorized" }, 401);
    await expect(apiRequest("/auth/me", { token: requestToken })).rejects.toMatchObject({ status: 401 });
    expect(getAuthToken()).toBe(requestToken === "active-token" ? null : "active-token");
  });
});
