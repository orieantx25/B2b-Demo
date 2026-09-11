import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/auth/validation";
import { rateLimit } from "@/lib/auth/rate-limit";
import { getProfileByEmail } from "@/lib/db/profiles";
import { signSession, setSessionCookie } from "@/lib/auth/session";
import { roleHomePath } from "@/lib/auth/roles";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`login:${ip}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid email" }, { status: 400 });
  }

  const profile = await getProfileByEmail(parsed.data.email);
  if (!profile) {
    return NextResponse.json(
      { error: "Email not registered — contact your admin" },
      { status: 401 }
    );
  }
  if (!profile.active) {
    return NextResponse.json({ error: "Account deactivated — contact your admin" }, { status: 403 });
  }

  const token = await signSession({
    userId: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    region: profile.region,
  });
  await setSessionCookie(token, {
    role: profile.role,
    name: profile.name,
    email: profile.email,
  });

  return NextResponse.json({
    ok: true,
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      region: profile.region,
    },
    redirectTo: roleHomePath(profile.role),
  });
}
