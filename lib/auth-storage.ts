import type { AuthUser, LoginData } from "@/types/auth";

const AUTH_TOKEN_KEY = "dinerate_auth_token";
const AUTH_USER_KEY = "dinerate_auth_user";
const AUTH_SESSION_EVENT = "dinerate-auth-session-changed";

export function storeAuthSession({ token, user }: LoginData): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getAuthToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function parseStoredUser(storedUser: string | null): AuthUser | null {
  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthSession(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function subscribeToAuthSession(
  onStoreChange: () => void,
): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(AUTH_SESSION_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(AUTH_SESSION_EVENT, onStoreChange);
  };
}

export function getAuthSessionSnapshot(): string | null {
  return localStorage.getItem(AUTH_USER_KEY);
}

export function getServerAuthSessionSnapshot(): null {
  return null;
}