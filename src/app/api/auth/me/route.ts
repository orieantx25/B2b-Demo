import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProfileById } from "@/lib/db/profiles";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  // Prefer JWT session for identity so Vercel serverless instances don't
  // 401 when the in-memory profile store was cold-started elsewhere.
  const profile = await getProfileById(session.userId);
  if (profile && !profile.active) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.userId,
      email: session.email,
      name: profile?.name || session.name,
      role: (profile?.role || session.role) as typeof session.role,
      region: profile?.region || session.region,
    },
  });
}
