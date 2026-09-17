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
import { DEMO_AUTH_DISABLED, DEMO_USER } from "@/lib/auth/demo";
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

const STORAGE_KEY = "ugsot_auth_user";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]!) : null;
}

function readBootstrapUser(): AuthUser | null {
  if (DEMO_AUTH_DISABLED) return { ...DEMO_USER };
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthUser;
  } catch {
    /* ignore */
  }
  const role = readCookie("ugsot_role") as AppRole | null;
  if (!role) return null;
  let name = "";
  let email = "";
  try {
    const packed = readCookie("ugsot_user");
    if (packed) {
      const parsed = JSON.parse(packed) as { name?: string; email?: string };
      name = parsed.name || "";
      email = parsed.email || "";
    }
  } catch {
    /* ignore */
  }
  return {
    id: "session",
    email,
    name: name || "User",
    role,
    region: "NCR",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEMO_AUTH_DISABLED ? { ...DEMO_USER } : null);
  const [loading, setLoading] = useState(!DEMO_AUTH_DISABLED);
  const setPersona = useAppStore((s) => s.setPersona);

  const syncStoreUser = useCallback(
    (u: AuthUser) => {
      if (u.role === "operations") setPersona("operations");
      else if (u.role === "leadership") setPersona("leadership");
      else if (u.role === "admin" || u.role === "super_admin") setPersona("admin");
      else setPersona("b2b");

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
    if (DEMO_AUTH_DISABLED) {
      const demo = { ...DEMO_USER };
      setUser(demo);
      syncStoreUser(demo);
      setLoading(false);
      return;
    }

    const boot = readBootstrapUser();
    if (boot) {
      setUser(boot);
      syncStoreUser(boot);
      setLoading(false);
    }

    try {
      const res = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      if (!res.ok) {
        if (!boot) setUser(null);
        return;
      }
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        syncStoreUser(data.user);
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
        } catch {
          /* ignore */
        }
      } else if (!boot) {
        setUser(null);
      }
    } catch {
      if (!boot) setUser(null);
    } finally {
      setLoading(false);
    }
  }, [syncStoreUser]);

  const logout = useCallback(async () => {
    if (DEMO_AUTH_DISABLED) {
      // Login removed from product — stay in app as demo Super Admin
      window.location.href = "/b2b";
      return;
    }
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, loading, refresh, logout }),
    [user, loading, refresh, logout]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}

export function roleFromMember(role: Parameters<typeof fromLegacyRole>[0]) {
  return fromLegacyRole(role);
}

export function persistAuthUser(user: AuthUser) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
}
