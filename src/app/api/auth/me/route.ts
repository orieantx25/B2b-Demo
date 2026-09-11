import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getProfileById } from "@/lib/db/profiles";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const profile = await getProfileById(session.userId);
  if (!profile || !profile.active) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({
    user: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      region: profile.region,
    },
  });
}
