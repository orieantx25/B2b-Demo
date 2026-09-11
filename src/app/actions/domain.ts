"use server";

import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { getServerDb } from "@/lib/db/local";
import { uid } from "@/lib/utils";

async function requireUser() {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

const scheduleSchema = z.object({
  consultantName: z.string().min(1),
  consultantId: z.string().optional(),
  date: z.string().min(1),
  time: z.string().min(1),
  type: z.enum(["In Person", "Online"]),
  phone: z.string().optional(),
  email: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  organization: z.string().optional(),
});

export async function scheduleMeetingAction(input: z.infer<typeof scheduleSchema>) {
  const session = await requireUser();
  const parsed = scheduleSchema.parse(input);
  const db = getServerDb();
  const id = uid("mtg");
  const meeting = {
    id,
    consultantId: parsed.consultantId,
    consultantName: parsed.consultantName,
    date: parsed.date,
    time: parsed.time,
    type: parsed.type,
    status: "Scheduled" as const,
    ownerId: session.userId,
    phone: parsed.phone,
    email: parsed.email,
    location: parsed.location,
    notes: parsed.notes,
    organization: parsed.organization,
    createdAt: new Date().toISOString(),
  };
  db.domain.meetings.unshift(meeting);
  db.domain.activities.unshift({
    id: uid("act"),
    type: "meeting",
    title: "Meeting scheduled",
    description: `${parsed.consultantName} · ${parsed.date}`,
    actorId: session.userId,
    consultantId: parsed.consultantId,
    createdAt: new Date().toISOString(),
  });
  return meeting;
}

export async function completeMeetingAction(meetingId: string) {
  const session = await requireUser();
  const db = getServerDb();
  const m = db.domain.meetings.find((x) => x.id === meetingId);
  if (!m) throw new Error("Meeting not found");
  m.status = "Completed";
  db.domain.activities.unshift({
    id: uid("act"),
    type: "meeting",
    title: "Meeting completed",
    description: m.consultantName,
    actorId: session.userId,
    consultantId: m.consultantId,
    createdAt: new Date().toISOString(),
  });
  return m;
}

const mouSchema = z.object({
  consultantId: z.string(),
  meetingId: z.string(),
  commercialType: z.enum(["Standard", "Non-Standard"]),
  slab: z.string().optional(),
  notes: z.string().optional(),
});

export async function requestMouAction(input: z.infer<typeof mouSchema>) {
  const session = await requireUser();
  const parsed = mouSchema.parse(input);
  const db = getServerDb();
  const id = uid("mou");
  const slaDueAt = new Date(Date.now() + 3 * 86400000).toISOString();
  const mou = {
    id,
    consultantId: parsed.consultantId,
    meetingId: parsed.meetingId,
    requestedBy: session.userId,
    status: "Requested" as const,
    commercialType: parsed.commercialType,
    slab: parsed.slab as "Standard Slab A" | "Standard Slab B" | "Standard Slab C" | undefined,
    legalStatus: "Not Started" as const,
    financeStatus: "Not Started" as const,
    notes: parsed.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    slaDueAt,
  };
  db.domain.mous.unshift(mou);
  const c = db.domain.consultants.find((x) => x.id === parsed.consultantId);
  if (c) {
    c.mouStatus = "Requested";
    c.updatedAt = new Date().toISOString();
  }
  return mou;
}

export async function syncDomainFromClientAction(payload: {
  meetings?: unknown[];
  consultants?: unknown[];
  mous?: unknown[];
  activities?: unknown[];
}) {
  // Optional bridge for optimistic client → server mirror (local mode)
  const session = await requireUser();
  const db = getServerDb();
  if (Array.isArray(payload.activities) && payload.activities.length) {
    db.domain.activities.unshift({
      id: uid("act"),
      type: "sync",
      title: "Client sync",
      description: `Mirror update by ${session.email}`,
      actorId: session.userId,
      createdAt: new Date().toISOString(),
    });
  }
  return { ok: true };
}
