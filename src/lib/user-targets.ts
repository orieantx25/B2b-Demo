import type { Consultant, Meeting, UserTargets } from "@/types";

export type TargetMetric = "schools" | "consultants" | "meetings" | "coachings";

export interface AchievedCounts {
  schools: number;
  consultants: number;
  meetings: number;
  coachings: number;
}

export function emptyTargets(userId: string): UserTargets {
  return {
    userId,
    schools: 0,
    consultants: 0,
    meetings: 0,
    coachings: 0,
    updatedAt: new Date().toISOString(),
  };
}

/** Achieved counts for a B2B user — used only in Admin/Reports. */
export function computeAchieved(
  userId: string,
  consultants: Consultant[],
  meetings: Meeting[]
): AchievedCounts {
  const mine = consultants.filter((c) => c.ownerId === userId);
  return {
    schools: mine.filter((c) => (c.partnerKind || "Other") === "School").length,
    consultants: mine.length,
    meetings: meetings.filter((m) => m.ownerId === userId && m.status !== "Cancelled").length,
    coachings: mine.filter((c) => (c.partnerKind || "Other") === "Coaching").length,
  };
}

export function pct(achieved: number, target: number): number | null {
  if (!target || target <= 0) return null;
  return Math.round((achieved / target) * 100);
}

export function progressTone(achieved: number, target: number): "success" | "warn" | "danger" | "neutral" {
  const p = pct(achieved, target);
  if (p === null) return "neutral";
  if (p >= 100) return "success";
  if (p >= 60) return "warn";
  return "danger";
}
