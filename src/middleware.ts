import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/jwt";
import { canAccessPath, roleHomePath } from "@/lib/auth/roles";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public assets & auth APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (pathname === "/login" || pathname === "/") {
    if (session) {
      return NextResponse.redirect(new URL(roleHomePath(session.role), req.url));
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  if (!session) {
    const login = new URL("/login", req.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (!canAccessPath(session.role, pathname)) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-ugsot-user", session.userId);
  res.headers.set("x-ugsot-role", session.role);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
