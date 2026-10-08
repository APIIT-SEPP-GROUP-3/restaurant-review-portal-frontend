import { USER_ROLES, type AuthUser, type LoginData } from "@/types/auth";

const AUTH_TOKEN_KEY = "dinerate_auth_token";
const AUTH_USER_KEY = "dinerate_auth_user";
const AUTH_SESSION_EVENT = "dinerate-auth-session-changed";

export class AuthStorageError extends Error {
  constructor() { super("Browser storage is unavailable. Allow site storage and try signing in again."); }
}

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

function expiresAt(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const encoded = part.replaceAll("-", "+").replaceAll("_", "/");
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    return typeof payload.exp === "number" && Number.isFinite(payload.exp) ? payload.exp * 1000 : null;
  } catch { return null; }
}

function notify() { window.dispatchEvent(new Event(AUTH_SESSION_EVENT)); }

export function storeAuthSession({ token, user }: LoginData): void {
  try {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    clearAuthSession();
    throw new AuthStorageError();
  }
  notify();
}

export function storeAuthUser(user: AuthUser): void {
  try { window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user)); } catch { throw new AuthStorageError(); }
  notify();
}

export function getAuthToken(): string | null {
  const token = read(AUTH_TOKEN_KEY);
  const expiration = token ? expiresAt(token) : null;
  return expiration !== null && expiration <= Date.now() ? null : token;
}

export function parseStoredUser(storedUser: string | null): AuthUser | null {
  if (!storedUser) return null;
  try {
    const user = JSON.parse(storedUser);
    return user && Number.isInteger(user.id) && user.id > 0 &&
      typeof user.firstName === "string" && typeof user.lastName === "string" &&
      typeof user.email === "string" && USER_ROLES.includes(user.role) ? user as AuthUser : null;
  } catch { return null; }
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(AUTH_TOKEN_KEY); window.localStorage.removeItem(AUTH_USER_KEY); } catch { /* Storage can be disabled by the browser. */ }
  notify();
}

export function subscribeToAuthSession(onStoreChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  function scheduleExpiry() {
    clearTimeout(timer);
    const token = getAuthToken();
    const expiration = token ? expiresAt(token) : null;
    if (expiration !== null) timer = setTimeout(changed, Math.min(Math.max(0, expiration - Date.now() + 50), 2147483647));
  }
  function changed() { onStoreChange(); scheduleExpiry(); }
  function storage(event: StorageEvent) {
    if (event.key === null || event.key === AUTH_TOKEN_KEY || event.key === AUTH_USER_KEY) changed();
  }
  window.addEventListener("storage", storage);
  window.addEventListener(AUTH_SESSION_EVENT, changed);
  scheduleExpiry();
  return () => {
    clearTimeout(timer);
    window.removeEventListener("storage", storage);
    window.removeEventListener(AUTH_SESSION_EVENT, changed);
  };
}

export function getAuthSessionSnapshot(): string | null {
  const storedUser = read(AUTH_USER_KEY);
  return getAuthToken() && parseStoredUser(storedUser) ? storedUser : null;
}

export function getServerAuthSessionSnapshot(): null { return null; }
