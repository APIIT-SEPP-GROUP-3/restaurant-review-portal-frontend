"use client";

import { useMemo, useSyncExternalStore } from "react";
import {
  getAuthSessionSnapshot,
  getServerAuthSessionSnapshot,
  parseStoredUser,
  subscribeToAuthSession,
} from "@/lib/auth-storage";

export function useAuthUser() {
  const session = useSyncExternalStore(subscribeToAuthSession, getAuthSessionSnapshot, getServerAuthSessionSnapshot);
  return useMemo(() => parseStoredUser(session), [session]);
}
