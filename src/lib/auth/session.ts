import { cookies } from "next/headers";
import { SESSION_COOKIE, signSession, verifySessionToken } from "@/lib/auth/jwt";
import type { SessionPayload, AppRole } from "@/lib/auth/roles";

export { SESSION_COOKIE, signSession, verifySessionToken };

/** Readable by the browser so the shell can show the correct workspace switcher on Vercel. */
export const UI_ROLE_COOKIE = "ugsot_role";
export const UI_USER_COOKIE = "ugsot_user";

const cookieBase = {
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function setSessionCookie(token: string, meta?: { role: AppRole; name: string; email: string }) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    ...cookieBase,
    httpOnly: true,
  });
  if (meta) {
    cookieStore.set(UI_ROLE_COOKIE, meta.role, {
      ...cookieBase,
      httpOnly: false,
    });
    cookieStore.set(
      UI_USER_COOKIE,
      encodeURIComponent(JSON.stringify({ name: meta.name, email: meta.email, role: meta.role })),
      {
        ...cookieBase,
        httpOnly: false,
      }
    );
  }
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  const clear = { ...cookieBase, maxAge: 0 };
  cookieStore.set(SESSION_COOKIE, "", { ...clear, httpOnly: true });
  cookieStore.set(UI_ROLE_COOKIE, "", { ...clear, httpOnly: false });
  cookieStore.set(UI_USER_COOKIE, "", { ...clear, httpOnly: false });
}
