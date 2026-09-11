import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { listAllProfiles, createOrUpdateProfile, setActive } from "@/lib/db/profiles";
import { profileSchema } from "@/lib/auth/validation";

export async function GET() {
  const session = await getSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profiles = await listAllProfiles();
  return NextResponse.json({ profiles });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Only super_admin can create other super_admins
  const body = await req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  if (parsed.data.role === "super_admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Only Super Admin can assign super_admin" }, { status: 403 });
  }
  const profile = await createOrUpdateProfile(parsed.data);
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (typeof body.active === "boolean" && body.id) {
    const profile = await setActive(body.id, body.active);
    if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ profile });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  }
  if (parsed.data.role === "super_admin" && session.role !== "super_admin") {
    return NextResponse.json({ error: "Only Super Admin can assign super_admin" }, { status: 403 });
  }
  const profile = await createOrUpdateProfile(parsed.data);
  return NextResponse.json({ profile });
}
