"use client";

import { useMemo, useSyncExternalStore } from "react";
import { getAuthSessionSnapshot, getServerAuthSessionSnapshot, parseStoredUser, subscribeToAuthSession } from "@/lib/auth-storage";

const subscribeToHydration = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function useAuthSession() {
  const ready = useSyncExternalStore(subscribeToHydration, clientReady, serverReady);
  const session = useSyncExternalStore(subscribeToAuthSession, getAuthSessionSnapshot, getServerAuthSessionSnapshot);
  const user = useMemo(() => parseStoredUser(session), [session]);
  return { user, ready };
}

export function useAuthUser() { return useAuthSession().user; }
