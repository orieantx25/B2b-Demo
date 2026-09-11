import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { readSettings, writeSetting } from "@/lib/db/profiles";
import { settingsSchema } from "@/lib/auth/validation";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await readSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: Request) {
  const session = await getSession();
  if (!session || !["super_admin", "admin"].includes(session.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }
  for (const [key, value] of Object.entries(parsed.data)) {
    if (typeof value === "string") await writeSetting(key, value);
  }
  const settings = await readSettings();
  return NextResponse.json({ settings });
}
