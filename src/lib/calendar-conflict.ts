import type { EventItem } from "@/types";

/** Parse "HH:MM" or "H:MM" to minutes from midnight. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map((x) => parseInt(x, 10));
  return (h || 0) * 60 + (m || 0);
}

/**
 * Meeting conflicts with an event when same calendar date and meeting start
 * falls inside the event window [startTime, endTime).
 */
export function meetingConflictsWithEvent(
  meetingDate: string,
  meetingTime: string,
  event: EventItem
): boolean {
  if (event.date !== meetingDate) return false;
  const t = timeToMinutes(meetingTime);
  const start = timeToMinutes(event.startTime || "00:00");
  const end = timeToMinutes(event.endTime || "23:59");
  return t >= start && t < end;
}

export function findConflictingEvent(
  events: EventItem[],
  date: string,
  time: string,
  opts?: { ownerId?: string; onlyMine?: boolean }
): EventItem | null {
  const scoped = opts?.onlyMine && opts.ownerId
    ? events.filter((e) => e.ownerId === opts.ownerId || e.invites?.some((i) => i.memberId === opts.ownerId))
    : events;
  return scoped.find((e) => meetingConflictsWithEvent(date, time, e)) || null;
}
