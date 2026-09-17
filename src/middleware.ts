import { NextResponse, type NextRequest } from "next/server";

/**
 * Demo build: login gate removed. Production email+password auth is specified in
 * PRD-uGSOT-B2B-Operations-Portal.md only — re-enable session checks for production.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|svg|ico|webp)$/)
  ) {
    return NextResponse.next();
  }

  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/b2b", req.url));
  }

  const res = NextResponse.next();
  res.headers.set("x-ugsot-user", "USR-SUPERADMIN");
  res.headers.set("x-ugsot-role", "super_admin");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
