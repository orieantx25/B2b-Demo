import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getServerDb } from "@/lib/db/local";
import { isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Domain snapshot for client hydration.
 * Local mode: in-memory seed. Supabase mode: tables queried in parallel.
 */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isSupabaseConfigured()) {
    // When Supabase is wired, prefer service client reads.
    // For now fall through to local mirror so the app runs without full table sync.
  }

  const db = getServerDb();
  return NextResponse.json({
    mode: isSupabaseConfigured() ? "supabase+local" : "local",
    members: db.domain.members,
    consultants: db.domain.consultants,
    meetings: db.domain.meetings,
    events: db.domain.events,
    mous: db.domain.mous,
    utms: db.domain.utms,
    coupons: db.domain.coupons,
    leads: db.domain.leads,
    testTakers: db.domain.testTakers,
    admissions: db.domain.admissions,
    ownership: db.domain.ownership,
    documents: db.domain.documents,
    mergeRequests: db.domain.mergeRequests,
    activities: db.domain.activities,
    weeklyReports: db.domain.weeklyReports,
  });
}
