"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { generateSeedData } from "@/data/seed";
import { addDays, uid } from "@/lib/utils";
import type {
  ActivityItem,
  CommercialType,
  Consultant,
  Coupon,
  DocType,
  EventItem,
  Meeting,
  MeetingType,
  MergeRequest,
  MouRequest,
  Persona,
  StandardSlab,
  ToastItem,
  Workspace,
} from "@/types";

const seed = generateSeedData();

interface Store extends ReturnType<typeof buildInitial> {
  setPersona: (p: Persona) => void;
  setWorkspace: (w: Workspace) => void;
  addToast: (t: Omit<ToastItem, "id">) => void;
  dismissToast: (id: string) => void;
  scheduleMeeting: (input: {
    consultantName: string;
    consultantId?: string;
    date: string;
    time: string;
    type: MeetingType;
    phone?: string;
    email?: string;
    location?: string;
    notes?: string;
    organization?: string;
    photoUrl?: string;
    geo?: { lat: number; lng: number; label?: string; capturedAt: string };
  }) => string;
  completeMeeting: (id: string) => void;
  attachMeetingPhoto: (
    meetingId: string,
    payload: { photoUrl: string; geo: { lat: number; lng: number; label?: string; capturedAt: string } }
  ) => void;
  rescheduleMeeting: (id: string, date: string, time: string) => void;
  createEvent: (input: Omit<EventItem, "id" | "createdAt" | "ownerId">) => void;
  createConsultant: (input: {
    name: string;
    organization: string;
    phone: string;
    email: string;
    region: string;
    meetingId?: string;
    force?: boolean;
  }) => { consultant: Consultant; duplicates: Consultant[] };
  findDuplicates: (name: string, phone: string, email: string) => Consultant[];
  requestMerge: (primaryId: string, duplicateId: string, reason: string) => void;
  resolveMerge: (id: string, approve: boolean) => void;
  requestMou: (input: {
    consultantId: string;
    meetingId: string;
    commercialType: CommercialType;
    slab?: StandardSlab;
    notes?: string;
  }) => void;
  startVerification: (mouId: string) => void;
  requestRework: (mouId: string, items: DocType[], message: string) => void;
  approveMou: (mouId: string) => void;
  generateWo: (mouId: string) => void;
  sendWo: (mouId: string) => void;
  markSigned: (mouId: string) => void;
  submitReworkDocs: (mouId: string) => void;
  requestUtm: (consultantId: string) => void;
  createChildUtm: (consultantId: string, parentUtmId: string) => void;
  createCoupon: (consultantId: string, code: string) => void;
  transferOwnership: (consultantId: string, newOwnerId: string, reason: string, comments?: string) => void;
  simulateFirstLead: (consultantId: string) => void;
  uploadDocument: (consultantId: string, type: DocType, mouId?: string) => void;
  markReportReviewed: (id: string) => void;
  updateReportNotes: (id: string, notes: string) => void;
  applyCardxExtract: (data: {
    name: string;
    phone: string;
    email: string;
    organization: string;
    designation?: string;
  }) => string;
}

function buildInitial() {
  return {
    persona: "b2b" as Persona,
    workspace: "b2b" as Workspace,
    currentUserId: seed.members.find((m) => m.role === "B2B Member")?.id || seed.members[8]!.id,
    members: seed.members,
    consultants: seed.consultants,
    meetings: seed.meetings,
    events: seed.events,
    mous: seed.mous,
    utms: seed.utms,
    coupons: seed.coupons,
    leads: seed.leads,
    testTakers: seed.testTakers,
    admissions: seed.admissions,
    ownership: seed.ownership,
    documents: seed.documents,
    mergeRequests: seed.mergeRequests,
    activities: seed.activities,
    weeklyReports: seed.weeklyReports,
    toasts: [] as ToastItem[],
  };
}

function pushActivity(
  activities: ActivityItem[],
  item: Omit<ActivityItem, "id" | "createdAt">
) {
  activities.unshift({ ...item, id: uid("act"), createdAt: new Date().toISOString() });
}

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
  ...buildInitial(),

  setPersona: (persona) => {
    const { members } = get();
    let currentUserId = get().currentUserId;
    if (persona === "b2b") currentUserId = members.find((m) => m.role === "B2B Member")!.id;
    if (persona === "operations") currentUserId = members.find((m) => m.role === "Operations")!.id;
    if (persona === "leadership") currentUserId = members.find((m) => m.role === "Leadership")!.id;
    if (persona === "admin") currentUserId = members.find((m) => m.role === "Admin")!.id;
    const workspace: Workspace =
      persona === "operations" ? "operations" : persona === "leadership" ? "reports" : get().workspace === "operations" && persona === "b2b" ? "b2b" : get().workspace;
    set({ persona, currentUserId, workspace: persona === "leadership" ? "reports" : persona === "operations" ? "operations" : workspace });
  },

  setWorkspace: (workspace) => set({ workspace }),

  addToast: (t) => {
    const id = uid("toast");
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    setTimeout(() => get().dismissToast(id), 3200);
  },

  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  scheduleMeeting: (input) => {
    const id = uid("mtg");
    const meeting: Meeting = {
      id,
      ...input,
      status: "Scheduled",
      ownerId: get().currentUserId,
      createdAt: new Date().toISOString(),
    };
    set((s) => {
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId: input.consultantId,
        type: "meeting",
        title: "Meeting scheduled",
        description: `${input.consultantName} · ${input.date} ${input.time}`,
        actorId: s.currentUserId,
      });
      return { meetings: [meeting, ...s.meetings], activities };
    });
    get().addToast({ title: "Meeting scheduled", variant: "success" });
    return id;
  },

  completeMeeting: (id) => {
    set((s) => ({
      meetings: s.meetings.map((m) => (m.id === id ? { ...m, status: "Completed" } : m)),
    }));
    get().addToast({ title: "Meeting marked completed", variant: "success" });
  },

  attachMeetingPhoto: (meetingId, payload) => {
    set((s) => ({
      meetings: s.meetings.map((m) =>
        m.id === meetingId ? { ...m, photoUrl: payload.photoUrl, geo: payload.geo } : m
      ),
    }));
    get().addToast({
      title: "Geotag photo attached",
      description: payload.geo.label || `${payload.geo.lat}, ${payload.geo.lng}`,
      variant: "success",
    });
  },

  rescheduleMeeting: (id, date, time) => {
    set((s) => ({
      meetings: s.meetings.map((m) =>
        m.id === id ? { ...m, date, time, status: "Rescheduled" } : m
      ),
    }));
    get().addToast({ title: "Meeting rescheduled", variant: "success" });
  },

  createEvent: (input) => {
    set((s) => ({
      events: [
        {
          ...input,
          id: uid("evt"),
          ownerId: s.currentUserId,
          createdAt: new Date().toISOString(),
        },
        ...s.events,
      ],
    }));
    get().addToast({ title: "Event created", variant: "success" });
  },

  findDuplicates: (name, phone, email) => {
    const n = name.trim().toLowerCase();
    const p = phone.replace(/\D/g, "");
    const e = email.trim().toLowerCase();
    return get().consultants.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(n) || n.includes(c.name.toLowerCase().slice(0, 8));
      const phoneMatch = p && c.phone.replace(/\D/g, "").endsWith(p.slice(-8));
      const emailMatch = e && c.email.toLowerCase() === e;
      return nameMatch || phoneMatch || emailMatch;
    }).slice(0, 5);
  },

  createConsultant: (input) => {
    const duplicates = input.force ? [] : get().findDuplicates(input.name, input.phone, input.email);
    if (duplicates.length) {
      return { consultant: duplicates[0]!, duplicates };
    }
    const owner = get().members.find((m) => m.id === get().currentUserId)!;
    const code = `CNS-${10000 + get().consultants.length + 1}`;
    const consultant: Consultant = {
      id: uid("cns"),
      name: input.name,
      organization: input.organization || input.name,
      phone: input.phone,
      email: input.email,
      ownerId: owner.id,
      region: input.region || owner.region,
      consultantCode: code,
      status: "Pending",
      mouStatus: "None",
      utmStatus: "None",
      firstMeetingId: input.meetingId,
      firstMeetingDate: new Date().toISOString(),
      leadsCount: 0,
      testTakersCount: 0,
      admissionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((s) => {
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId: consultant.id,
        type: "created",
        title: "Consultant created",
        description: `${consultant.name} · ${code}`,
        actorId: s.currentUserId,
      });
      const meetings = s.meetings.map((m) =>
        input.meetingId && m.id === input.meetingId
          ? { ...m, consultantId: consultant.id, consultantName: consultant.name }
          : m
      );
      return {
        consultants: [consultant, ...s.consultants],
        ownership: [
          {
            id: uid("own"),
            consultantId: consultant.id,
            ownerId: owner.id,
            ownerName: owner.name,
            fromDate: new Date().toISOString(),
            reason: "Initial assignment",
          },
          ...s.ownership,
        ],
        meetings,
        activities,
      };
    });
    get().addToast({ title: "Consultant created", description: code, variant: "success" });
    return { consultant, duplicates: [] };
  },

  requestMerge: (primaryId, duplicateId, reason) => {
    const mr: MergeRequest = {
      id: uid("mrg"),
      primaryId,
      duplicateId,
      requestedBy: get().currentUserId,
      status: "Pending",
      reason,
      createdAt: new Date().toISOString(),
    };
    set((s) => ({ mergeRequests: [mr, ...s.mergeRequests] }));
    get().addToast({ title: "Merge request submitted", description: "Awaiting Operations/Admin approval" });
  },

  resolveMerge: (id, approve) => {
    set((s) => ({
      mergeRequests: s.mergeRequests.map((m) =>
        m.id === id
          ? {
              ...m,
              status: approve ? "Approved" : "Rejected",
              reviewedBy: s.currentUserId,
              reviewedAt: new Date().toISOString(),
            }
          : m
      ),
    }));
    get().addToast({
      title: approve ? "Merge approved" : "Merge rejected",
      variant: "success",
    });
  },

  requestMou: ({ consultantId, meetingId, commercialType, slab, notes }) => {
    const mou: MouRequest = {
      id: uid("mou"),
      consultantId,
      meetingId,
      requestedBy: get().currentUserId,
      status: "Requested",
      commercialType,
      slab,
      paymentTerms:
        commercialType === "Standard"
          ? "Net 30 · Management Approved"
          : "Custom — existing Legal/Finance email chain",
      legalStatus: commercialType === "Non-Standard" ? "Not Started" : "N/A",
      financeStatus: commercialType === "Non-Standard" ? "Not Started" : "N/A",
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaDueAt: addDays(new Date().toISOString(), 7),
    };
    set((s) => {
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId,
        type: "mou",
        title: "MOU requested",
        description: `${commercialType}${slab ? ` · ${slab}` : ""}`,
        actorId: s.currentUserId,
      });
      return {
        mous: [mou, ...s.mous],
        consultants: s.consultants.map((c) =>
          c.id === consultantId ? { ...c, mouStatus: "Requested", updatedAt: new Date().toISOString() } : c
        ),
        activities,
      };
    });
    get().addToast({ title: "MOU requested", variant: "success" });
  },

  startVerification: (mouId) => {
    set((s) => ({
      mous: s.mous.map((m) => (m.id === mouId ? { ...m, status: "Verification", updatedAt: new Date().toISOString() } : m)),
      consultants: s.consultants.map((c) => {
        const mou = s.mous.find((m) => m.id === mouId);
        return mou && c.id === mou.consultantId ? { ...c, mouStatus: "Verification" } : c;
      }),
    }));
  },

  requestRework: (mouId, items, message) => {
    set((s) => {
      const mou = s.mous.find((m) => m.id === mouId)!;
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId: mou.consultantId,
        type: "rework",
        title: "Rework requested",
        description: message,
        actorId: s.currentUserId,
      });
      return {
        mous: s.mous.map((m) =>
          m.id === mouId
            ? { ...m, status: "Rework", reworkItems: items, reworkMessage: message, updatedAt: new Date().toISOString() }
            : m
        ),
        consultants: s.consultants.map((c) =>
          c.id === mou.consultantId ? { ...c, mouStatus: "Rework" } : c
        ),
        activities,
      };
    });
    get().addToast({ title: "Rework requested", description: "B2B notified — Action Required" });
  },

  submitReworkDocs: (mouId) => {
    set((s) => ({
      mous: s.mous.map((m) =>
        m.id === mouId
          ? { ...m, status: "Verification", reworkItems: undefined, reworkMessage: undefined, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
    get().addToast({ title: "Documents resubmitted", description: "Returned to verification", variant: "success" });
  },

  approveMou: (mouId) => {
    set((s) => {
      const mou = s.mous.find((m) => m.id === mouId)!;
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId: mou.consultantId,
        type: "mou",
        title: "MOU approved",
        description: mou.commercialType === "Standard" ? "Standard — streamlined" : "Non-standard approved",
        actorId: s.currentUserId,
      });
      return {
        mous: s.mous.map((m) =>
          m.id === mouId
            ? { ...m, status: "Approved", approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : m
        ),
        consultants: s.consultants.map((c) =>
          c.id === mou.consultantId ? { ...c, mouStatus: "Approved" } : c
        ),
        activities,
      };
    });
    get().addToast({ title: "MOU approved", variant: "success" });
  },

  generateWo: (mouId) => {
    const woNumber = `WO-2026-${2000 + get().mous.length}`;
    set((s) => {
      const mou = s.mous.find((m) => m.id === mouId)!;
      return {
        mous: s.mous.map((m) =>
          m.id === mouId
            ? {
                ...m,
                status: "WO Generated",
                woNumber,
                woGeneratedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
        consultants: s.consultants.map((c) =>
          c.id === mou.consultantId ? { ...c, mouStatus: "WO Generated" } : c
        ),
      };
    });
    get().addToast({ title: "WO generated", description: woNumber, variant: "success" });
  },

  sendWo: (mouId) => {
    set((s) => {
      const mou = s.mous.find((m) => m.id === mouId)!;
      return {
        mous: s.mous.map((m) =>
          m.id === mouId
            ? {
                ...m,
                status: "Awaiting Signature",
                woSentAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : m
        ),
        consultants: s.consultants.map((c) =>
          c.id === mou.consultantId ? { ...c, mouStatus: "Awaiting Signature" } : c
        ),
      };
    });
    get().addToast({ title: "WO sent", description: "Email simulated · Awaiting signature" });
  },

  markSigned: (mouId) => {
    set((s) => {
      const mou = s.mous.find((m) => m.id === mouId)!;
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId: mou.consultantId,
        type: "signed",
        title: "Signed copy received",
        description: mou.woNumber || "WO signed",
        actorId: s.currentUserId,
      });
      const docs = [
        {
          id: uid("doc"),
          consultantId: mou.consultantId,
          mouId,
          type: "Signed WO" as const,
          name: `${mou.woNumber || "WO"}-signed.pdf`,
          status: "Uploaded" as const,
          uploadedAt: new Date().toISOString(),
          verification: "Match" as const,
        },
        ...s.documents,
      ];
      return {
        mous: s.mous.map((m) =>
          m.id === mouId
            ? { ...m, status: "Signed", signedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
            : m
        ),
        consultants: s.consultants.map((c) => {
          if (c.id !== mou.consultantId) return c;
          const nextStatus = c.leadsCount > 0 ? "Active" : c.utmStatus !== "None" ? "UTM Ready" : "MOU Signed";
          return { ...c, mouStatus: "Signed", status: nextStatus };
        }),
        documents: docs,
        activities,
      };
    });
    get().addToast({ title: "Signed copy received", variant: "success" });
  },

  requestUtm: (consultantId) => {
    const code = `UTM-${String(6000 + get().utms.length).padStart(4, "0")}`;
    const counsellor = `UTM-C-${4000 + get().utms.length}`;
    set((s) => {
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId,
        type: "utm",
        title: "UTM created",
        description: `${code} · Synced from Existing UTM System`,
        actorId: s.currentUserId,
      });
      return {
        utms: [
          {
            id: uid("utm"),
            code,
            consultantId,
            counsellorCode: counsellor,
            status: "Mapped",
            createdBy: s.currentUserId,
            createdAt: new Date().toISOString(),
            source: "Existing UTM System",
          },
          ...s.utms,
        ],
        consultants: s.consultants.map((c) => {
          if (c.id !== consultantId) return c;
          return {
            ...c,
            utmStatus: "Mapped",
            existingUtmCode: c.existingUtmCode || counsellor,
            status: c.leadsCount > 0 ? "Active" : c.mouStatus === "Signed" ? "UTM Ready" : "UTM Ready",
          };
        }),
        activities,
      };
    });
    get().addToast({ title: "UTM mapped", description: `${code} · Existing UTM System`, variant: "success" });
  },

  createChildUtm: (consultantId, parentUtmId) => {
    const code = `UTM-${String(7000 + get().utms.length).padStart(4, "0")}`;
    set((s) => ({
      utms: [
        {
          id: uid("utm"),
          code,
          consultantId,
          parentUtmId,
          counsellorCode: s.consultants.find((c) => c.id === consultantId)?.existingUtmCode,
          status: "Mapped",
          createdBy: s.currentUserId,
          createdAt: new Date().toISOString(),
          source: "Existing UTM System",
        },
        ...s.utms,
      ],
    }));
    get().addToast({ title: "Child UTM created", description: code, variant: "success" });
  },

  createCoupon: (consultantId, code) => {
    const c = get().consultants.find((x) => x.id === consultantId)!;
    const coupon: Coupon = {
      id: uid("cpn"),
      code: code || `UGSOT${Date.now().toString().slice(-5)}`,
      consultantId,
      createdBy: get().currentUserId,
      createdFor: c.name,
      createdAt: new Date().toISOString(),
      status: "Active",
    };
    set((s) => ({ coupons: [coupon, ...s.coupons] }));
    get().addToast({ title: "Coupon created", description: `${coupon.code} · ${c.name}`, variant: "success" });
  },

  transferOwnership: (consultantId, newOwnerId, reason, comments) => {
    const newOwner = get().members.find((m) => m.id === newOwnerId)!;
    set((s) => {
      const now = new Date().toISOString();
      const ownership = s.ownership.map((o) =>
        o.consultantId === consultantId && !o.toDate ? { ...o, toDate: now } : o
      );
      ownership.unshift({
        id: uid("own"),
        consultantId,
        ownerId: newOwner.id,
        ownerName: newOwner.name,
        fromDate: now,
        reason,
        comments,
      });
      const activities = [...s.activities];
      pushActivity(activities, {
        consultantId,
        type: "ownership",
        title: "Ownership transferred",
        description: `→ ${newOwner.name}`,
        actorId: s.currentUserId,
      });
      return {
        ownership,
        consultants: s.consultants.map((c) =>
          c.id === consultantId ? { ...c, ownerId: newOwner.id, updatedAt: now } : c
        ),
        activities,
      };
    });
    get().addToast({ title: "Ownership transferred", description: newOwner.name, variant: "success" });
  },

  simulateFirstLead: (consultantId) => {
    const utm = get().utms.find((u) => u.consultantId === consultantId);
    const lead = {
      id: uid("lead"),
      consultantId,
      utmId: utm?.id,
      name: "Demo Lead",
      phone: "9876500001",
      createdAt: new Date().toISOString(),
      source: "Existing Lead System" as const,
    };
    set((s) => {
      const c = s.consultants.find((x) => x.id === consultantId)!;
      const wasPending = c.leadsCount === 0;
      const activities = [...s.activities];
      if (wasPending) {
        pushActivity(activities, {
          consultantId,
          type: "activation",
          title: "Consultant activated",
          description: "First lead received · Pending → Active",
          actorId: s.currentUserId,
        });
      }
      return {
        leads: [lead, ...s.leads],
        consultants: s.consultants.map((x) =>
          x.id === consultantId
            ? {
                ...x,
                leadsCount: x.leadsCount + 1,
                firstLeadId: x.firstLeadId || lead.id,
                firstLeadDate: x.firstLeadDate || lead.createdAt,
                status: "Active" as const,
              }
            : x
        ),
        activities,
      };
    });
    get().addToast({
      title: "First lead received",
      description: "Consultant → Active",
      variant: "success",
    });
  },

  uploadDocument: (consultantId, type, mouId) => {
    set((s) => ({
      documents: [
        {
          id: uid("doc"),
          consultantId,
          mouId,
          type,
          name: `${type.replace(/\s+/g, "_")}.pdf`,
          status: "Uploaded",
          uploadedAt: new Date().toISOString(),
          verification: "Needs Review",
        },
        ...s.documents.filter((d) => !(d.consultantId === consultantId && d.type === type && d.status === "Missing")),
      ],
    }));
    get().addToast({ title: "Document uploaded", description: type, variant: "success" });
  },

  markReportReviewed: (id) => {
    set((s) => ({
      weeklyReports: s.weeklyReports.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Reviewed",
              reviewedBy: s.currentUserId,
              reviewedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
    get().addToast({ title: "Weekly report marked reviewed", variant: "success" });
  },

  updateReportNotes: (id, notes) => {
    set((s) => ({
      weeklyReports: s.weeklyReports.map((r) => (r.id === id ? { ...r, notes } : r)),
    }));
    get().addToast({ title: "Report notes saved", variant: "success" });
  },

  applyCardxExtract: (data) => {
    get().addToast({
      title: "CardX extraction complete",
      description: "OCR assists only — Operations verifies",
    });
    return data.name;
  },
}),
    {
      name: "ugsot-b2b-demo",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => ({
        persona: s.persona,
        workspace: s.workspace,
        currentUserId: s.currentUserId,
        members: s.members,
        consultants: s.consultants,
        meetings: s.meetings,
        events: s.events,
        mous: s.mous,
        utms: s.utms,
        coupons: s.coupons,
        leads: s.leads,
        testTakers: s.testTakers,
        admissions: s.admissions,
        ownership: s.ownership,
        documents: s.documents,
        mergeRequests: s.mergeRequests,
        activities: s.activities,
        weeklyReports: s.weeklyReports,
      }),
    }
  )
);
