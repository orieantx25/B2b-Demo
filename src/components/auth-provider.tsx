"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppRole } from "@/lib/auth/roles";
import { useAppStore } from "@/store/app-store";
import { fromLegacyRole, legacyMemberRole } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  region: string;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const setPersona = useAppStore((s) => s.setPersona);
  const members = useAppStore((s) => s.members);

  const syncStoreUser = useCallback(
    (u: AuthUser) => {
      // Map auth role → store persona for existing filters
      if (u.role === "operations") setPersona("operations");
      else if (u.role === "leadership") setPersona("leadership");
      else if (u.role === "admin" || u.role === "super_admin") setPersona("admin");
      else setPersona("b2b");

      // Ensure profile id exists in members so currentUserId filters work
      const store = useAppStore.getState();
      const exists = store.members.some((m) => m.id === u.id);
      if (!exists) {
        useAppStore.setState({
          members: [
            {
              id: u.id,
              name: u.name,
              email: u.email,
              region: u.region,
              role: legacyMemberRole(u.role),
            },
            ...store.members,
          ],
          currentUserId: u.id,
        });
      } else {
        useAppStore.setState({ currentUserId: u.id });
      }
    },
    [setPersona]
  );

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        syncStoreUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncStoreUser]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Keep role labels consistent if members hydrate later
  useEffect(() => {
    if (!user || !members.length) return;
    if (!members.some((m) => m.id === user.id)) {
      syncStoreUser(user);
    }
  }, [members, user, syncStoreUser]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

/** Helper for demos — unused import guard */
export function roleFromMember(role: Parameters<typeof fromLegacyRole>[0]) {
  return fromLegacyRole(role);
}
