import type {
  Admission,
  ActivityItem,
  B2BMember,
  Consultant,
  Coupon,
  DocumentItem,
  EventItem,
  Lead,
  Meeting,
  MergeRequest,
  MouRequest,
  OwnershipRecord,
  TestTaker,
  UtmRecord,
  WeeklyReport,
  UserTargets,
} from "@/types";
import { addDays, uid } from "@/lib/utils";

const REGIONS = ["North", "South", "East", "West", "Central", "NCR", "Maharashtra", "Karnataka"];
const ORGS = [
  "Career Point", "Allen Career", "Resonance", "FIITJEE", "Aakash", "Motion Education",
  "Vibrant Academy", "Bansal Classes", "Super 30 Hub", "EduBridge", "Pathfinder",
  "Insight Academy", "Summit Coaching", "Prime Mentors", "Horizon Educare", "Vertex Institute",
  "Catalyst Prep", "Aspire Hub", "Nucleus Classes", "Orbit Learning", "Pinnacle Tutorials",
  "Bridge Mentors", "Scholar Nest", "Quest Academy", "Merit Lane", "Campus Connect",
];
const FIRST = ["Amit", "Rahul", "Priya", "Sneha", "Vikram", "Ananya", "Rohan", "Neha", "Karan", "Meera", "Arjun", "Isha", "Sanjay", "Pooja", "Nikhil", "Divya", "Manish", "Kavita", "Aditya", "Ritu"];
const LAST = ["Kumar", "Sharma", "Singh", "Patel", "Gupta", "Reddy", "Nair", "Joshi", "Mehta", "Verma", "Chopra", "Iyer", "Desai", "Malhotra", "Rao"];

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function isoDaysAgo(rng: () => number, maxDays: number) {
  const days = Math.floor(rng() * maxDays);
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + Math.floor(rng() * 8), Math.floor(rng() * 60), 0, 0);
  return d.toISOString();
}

export function generateSeedData() {
  const rng = mulberry32(20260822);

  const members: B2BMember[] = [];
  for (let i = 0; i < 24; i++) {
    const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
    const role =
      i === 0
        ? "Admin"
        : i === 1
          ? "Leadership"
          : i < 5
            ? "Operations"
            : i < 8
              ? "B2B Lead"
              : "B2B Member";
    members.push({
      id: `mem_${String(i + 1).padStart(3, "0")}`,
      name,
      email: `${name.toLowerCase().replace(/\s+/g, ".")}@ugsot.upgrad.com`,
      region: pick(rng, REGIONS),
      role,
    });
  }

  const b2bMembers = members.filter((m) => m.role === "B2B Member" || m.role === "B2B Lead");
  const consultants: Consultant[] = [];
  const ownership: OwnershipRecord[] = [];
  const meetings: Meeting[] = [];
  const documents: DocumentItem[] = [];
  const activities: ActivityItem[] = [];

  for (let i = 0; i < 120; i++) {
    const owner = pick(rng, b2bMembers);
    const name = `${pick(rng, ORGS)} ${i > 40 ? pick(rng, ["Centre", "Branch", "Hub", ""]) : ""}`.trim();
    const createdAt = isoDaysAgo(rng, 180);
    const phone = `9${Math.floor(100000000 + rng() * 899999999)}`;
    const email = `contact${i + 1}@${name.toLowerCase().replace(/\s+/g, "")}.edu.in`;
    const code = `CNS-${10000 + i}`;
    const hasUtm = rng() > 0.25;
    const hasMou = rng() > 0.35;
    const hasLead = hasUtm && rng() > 0.4;
    const leadsCount = hasLead ? Math.floor(20 + rng() * 180) : 0;
    const testTakersCount = hasLead ? Math.floor(leadsCount * (0.15 + rng() * 0.35)) : 0;
    const admissionsCount = hasLead ? Math.floor(testTakersCount * (0.05 + rng() * 0.2)) : 0;

    let status: Consultant["status"] = "Pending";
    let mouStatus: Consultant["mouStatus"] = "None";
    let utmStatus: Consultant["utmStatus"] = "None";

    if (hasMou) {
      const mouRoll = rng();
      if (mouRoll > 0.7) mouStatus = "Signed";
      else if (mouRoll > 0.55) mouStatus = "Awaiting Signature";
      else if (mouRoll > 0.4) mouStatus = "WO Sent";
      else if (mouRoll > 0.28) mouStatus = "WO Generated";
      else if (mouRoll > 0.18) mouStatus = "Approved";
      else if (mouRoll > 0.1) mouStatus = "Verification";
      else if (mouRoll > 0.05) mouStatus = "Rework";
      else mouStatus = "Requested";
      if (mouStatus === "Signed") status = "MOU Signed";
    }
    if (hasUtm) {
      utmStatus = "Mapped";
      if (!hasLead && status === "MOU Signed") status = "UTM Ready";
      if (!hasLead && status === "Pending") status = "UTM Ready";
    }
    if (hasLead) status = "Active";
    if (rng() > 0.97) status = "Inactive";

    const id = `cns_${String(i + 1).padStart(4, "0")}`;
    const firstMeetingDate = createdAt;

    const partnerKind: Consultant["partnerKind"] =
      rng() > 0.55 ? "Coaching" : rng() > 0.35 ? "School" : "Other";

    consultants.push({
      id,
      name,
      organization: name,
      phone,
      email,
      ownerId: owner.id,
      region: owner.region,
      consultantCode: code,
      existingUtmCode: hasUtm ? `UTM-C-${2000 + i}` : undefined,
      designation: pick(rng, ["Director", "Centre Head", "Counsellor", "Partner", "Owner"]),
      status,
      mouStatus,
      utmStatus,
      firstMeetingDate,
      firstLeadDate: hasLead ? addDays(createdAt, Math.floor(10 + rng() * 40)) : undefined,
      leadsCount,
      testTakersCount,
      admissionsCount,
      partnerKind,
      createdAt,
      updatedAt: isoDaysAgo(rng, 30),
    });

    ownership.push({
      id: uid("own"),
      consultantId: id,
      ownerId: owner.id,
      ownerName: owner.name,
      fromDate: createdAt,
      reason: "Initial assignment",
    });

    if (rng() > 0.7) {
      const prev = pick(rng, b2bMembers.filter((m) => m.id !== owner.id));
      ownership.unshift({
        id: uid("own"),
        consultantId: id,
        ownerId: prev.id,
        ownerName: prev.name,
        fromDate: addDays(createdAt, -40),
        toDate: createdAt,
        reason: "SPOC transfer",
        comments: "Relationship continuity preserved",
      });
    }

    const meetingCount = 1 + Math.floor(rng() * 4);
    for (let m = 0; m < meetingCount; m++) {
      const mDate = addDays(createdAt, m * Math.floor(2 + rng() * 10));
      const mid = uid("mtg");
      meetings.push({
        id: mid,
        consultantId: id,
        consultantName: name,
        date: mDate.slice(0, 10),
        time: `${9 + Math.floor(rng() * 8)}:${rng() > 0.5 ? "00" : "30"}`,
        type: rng() > 0.45 ? "In Person" : "Online",
        status: m === meetingCount - 1 && rng() > 0.7 ? "Scheduled" : "Completed",
        ownerId: owner.id,
        phone,
        email,
        location: rng() > 0.5 ? `${pick(rng, REGIONS)} Centre` : undefined,
        notes: rng() > 0.6 ? "Discussed partnership opportunity" : undefined,
        organization: name,
        createdAt: mDate,
      });
      if (m === 0) {
        consultants[i]!.firstMeetingId = mid;
      }
    }

    if (hasMou) {
      (["PAN", "GST", "Bank Details", "Authorized Signatory"] as const).forEach((type) => {
        documents.push({
          id: uid("doc"),
          consultantId: id,
          type,
          name: `${type}.pdf`,
          status: rng() > 0.15 ? "Uploaded" : "Missing",
          uploadedAt: isoDaysAgo(rng, 60),
          verification: rng() > 0.3 ? "Match" : rng() > 0.5 ? "Needs Review" : "Missing",
        });
      });
    }

    activities.push({
      id: uid("act"),
      consultantId: id,
      type: "created",
      title: "Consultant created",
      description: `${name} added to consultant master`,
      actorId: owner.id,
      createdAt,
    });
  }

  // Extra meetings to reach 300+
  while (meetings.length < 320) {
    const c = pick(rng, consultants);
    const d = isoDaysAgo(rng, 120);
    meetings.push({
      id: uid("mtg"),
      consultantId: c.id,
      consultantName: c.name,
      date: d.slice(0, 10),
      time: `${9 + Math.floor(rng() * 8)}:00`,
      type: rng() > 0.5 ? "In Person" : "Online",
      status: "Completed",
      ownerId: c.ownerId,
      phone: c.phone,
      email: c.email,
      organization: c.organization,
      createdAt: d,
    });
  }

  const events: EventItem[] = [];
  for (let i = 0; i < 36; i++) {
    const owner = pick(rng, b2bMembers);
    const startH = 9 + Math.floor(rng() * 4);
    events.push({
      id: uid("evt"),
      name: pick(rng, ["Partner Meet", "City Roadshow", "Counsellor Summit", "Campus Connect", "uGSOT Briefing", "Career Fair"]),
      date: isoDaysAgo(rng, 90).slice(0, 10),
      startTime: `${String(startH).padStart(2, "0")}:00`,
      endTime: `${String(startH + 3).padStart(2, "0")}:00`,
      location: pick(rng, ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Pune", "Jaipur", "Online"]),
      notes: "B2B outreach event",
      ownerId: owner.id,
      type: pick(rng, ["Career Fair", "Partner Meet", "Training", "Other"]),
      invites: [],
      eventData: [],
      createdAt: isoDaysAgo(rng, 90),
    });
  }

  const mous: MouRequest[] = [];
  const mouConsultants = consultants.filter((c) => c.mouStatus !== "None");
  mouConsultants.forEach((c, idx) => {
    const meeting = meetings.find((m) => m.consultantId === c.id && m.status === "Completed") || meetings.find((m) => m.consultantId === c.id)!;
    const createdAt = c.createdAt;
    const commercialType = rng() > 0.72 ? "Non-Standard" : "Standard";
    mous.push({
      id: `mou_${String(idx + 1).padStart(3, "0")}`,
      consultantId: c.id,
      meetingId: meeting.id,
      requestedBy: c.ownerId,
      status: c.mouStatus as MouRequest["status"],
      commercialType,
      slab: commercialType === "Standard" ? pick(rng, ["Standard Slab A", "Standard Slab B", "Standard Slab C"]) : undefined,
      paymentTerms: commercialType === "Standard" ? "Net 30 · Management Approved" : "Custom commercial — existing approval chain",
      woNumber: ["WO Generated", "WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus) ? `WO-2026-${1000 + idx}` : undefined,
      legalStatus: c.mouStatus === "Signed" ? "Approved" : commercialType === "Non-Standard" ? "In Review" : "N/A",
      financeStatus: c.mouStatus === "Signed" ? "Approved" : commercialType === "Non-Standard" ? "In Review" : "N/A",
      createdAt,
      updatedAt: c.updatedAt,
      slaDueAt: addDays(createdAt, 7),
      verifiedAt: ["Verification", "Rework", "Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed", "Legal Review", "Finance Approval"].includes(c.mouStatus)
        ? addDays(createdAt, 2)
        : undefined,
      approvedAt: ["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus) ? addDays(createdAt, 3) : undefined,
      woGeneratedAt: ["WO Generated", "WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus) ? addDays(createdAt, 4) : undefined,
      woSentAt: ["WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus) ? addDays(createdAt, 5) : undefined,
      signedAt: c.mouStatus === "Signed" ? addDays(createdAt, 8) : undefined,
      reworkItems: c.mouStatus === "Rework" ? ["GST"] : undefined,
      reworkMessage: c.mouStatus === "Rework" ? "Please upload the latest GST certificate." : undefined,
      opsTrack: ["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed", "Legal Review", "Finance Approval"].includes(
        c.mouStatus
      )
        ? {
            sentToLegalAt: addDays(createdAt, 3),
            financeApprovedAt: ["WO Generated", "WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus)
              ? addDays(createdAt, 4)
              : undefined,
            draftSharedAt: ["WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus)
              ? addDays(createdAt, 5)
              : undefined,
            sentToClientAt: ["WO Sent", "Awaiting Signature", "Signed"].includes(c.mouStatus)
              ? addDays(createdAt, 5)
              : undefined,
          }
        : undefined,
    });
  });

  // Ensure enough MOUs in queue states
  while (mous.length < 45) {
    const c = pick(rng, consultants.filter((x) => x.mouStatus === "None"));
    const meeting = meetings.find((m) => m.consultantId === c.id);
    if (!meeting) break;
    c.mouStatus = "Requested";
    mous.push({
      id: uid("mou"),
      consultantId: c.id,
      meetingId: meeting.id,
      requestedBy: c.ownerId,
      status: "Requested",
      commercialType: "Standard",
      slab: "Standard Slab A",
      paymentTerms: "Net 30 · Management Approved",
      legalStatus: "N/A",
      financeStatus: "N/A",
      createdAt: isoDaysAgo(rng, 10),
      updatedAt: isoDaysAgo(rng, 5),
      slaDueAt: addDays(new Date().toISOString(), 2),
    });
  }

  const utms: UtmRecord[] = [];
  consultants.filter((c) => c.utmStatus !== "None").forEach((c, i) => {
    const count = 1 + Math.floor(rng() * 3);
    let parent: string | undefined;
    for (let u = 0; u < count; u++) {
      const id = uid("utm");
      const code = `UTM-${String(1000 + i * 3 + u).padStart(4, "0")}`;
      utms.push({
        id,
        code,
        consultantId: c.id,
        counsellorCode: c.existingUtmCode,
        parentUtmId: u === 0 ? undefined : parent,
        status: "Mapped",
        createdBy: c.ownerId,
        createdAt: addDays(c.createdAt, 5 + u),
        source: "Existing UTM System",
      });
      if (u === 0) parent = id;
    }
  });
  while (utms.length < 110) {
    const c = pick(rng, consultants);
    utms.push({
      id: uid("utm"),
      code: `UTM-${String(5000 + utms.length).padStart(4, "0")}`,
      consultantId: c.id,
      counsellorCode: c.existingUtmCode || `UTM-C-${3000 + utms.length}`,
      status: "Mapped",
      createdBy: c.ownerId,
      createdAt: isoDaysAgo(rng, 60),
      source: "Existing UTM System",
    });
    if (c.utmStatus === "None") c.utmStatus = "Mapped";
  }

  const coupons: Coupon[] = [];
  for (let i = 0; i < 55; i++) {
    const c = pick(rng, consultants);
    coupons.push({
      id: uid("cpn"),
      code: `UGSOT${1000 + i}`,
      consultantId: c.id,
      createdBy: c.ownerId,
      createdFor: c.name,
      createdAt: isoDaysAgo(rng, 90),
      status: rng() > 0.15 ? "Active" : "Expired",
    });
  }

  const leads: Lead[] = [];
  const testTakers: TestTaker[] = [];
  const admissions: Admission[] = [];

  consultants.forEach((c) => {
    const utm = utms.find((u) => u.consultantId === c.id);
    for (let i = 0; i < c.leadsCount; i++) {
      const lid = uid("lead");
      const createdAt = addDays(c.firstLeadDate || c.createdAt, Math.floor(rng() * 60));
      leads.push({
        id: lid,
        consultantId: c.id,
        utmId: utm?.id,
        name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
        phone: `9${Math.floor(100000000 + rng() * 899999999)}`,
        createdAt,
        source: "Existing Lead System",
      });
      if (i === 0) {
        c.firstLeadId = lid;
      }
    }
    // Cap detailed lead objects for memory — store aggregate counts on consultant
  });

  // Keep a representative subset of lead detail records (~5k target via sampling)
  // If too many, trim to ~5200 while preserving first leads
  if (leads.length > 5200) {
    const firstIds = new Set(consultants.map((c) => c.firstLeadId).filter(Boolean));
    const kept = leads.filter((l) => firstIds.has(l.id));
    const rest = leads.filter((l) => !firstIds.has(l.id));
    const need = 5200 - kept.length;
    leads.length = 0;
    leads.push(...kept, ...rest.slice(0, need));
  } else {
    // Boost to 5000+ if short
    while (leads.length < 5100) {
      const c = pick(rng, consultants.filter((x) => x.status === "Active"));
      const utm = utms.find((u) => u.consultantId === c.id);
      leads.push({
        id: uid("lead"),
        consultantId: c.id,
        utmId: utm?.id,
        name: `${pick(rng, FIRST)} ${pick(rng, LAST)}`,
        phone: `9${Math.floor(100000000 + rng() * 899999999)}`,
        createdAt: isoDaysAgo(rng, 90),
        source: "Existing Lead System",
      });
      c.leadsCount += 1;
    }
  }

  // Sync counts from actual lead array for consistency on dashboards that sum
  const leadCountByC: Record<string, number> = {};
  leads.forEach((l) => {
    leadCountByC[l.consultantId] = (leadCountByC[l.consultantId] || 0) + 1;
  });
  consultants.forEach((c) => {
    if (leadCountByC[c.id]) {
      c.leadsCount = leadCountByC[c.id]!;
      if (c.status !== "Inactive" && c.leadsCount > 0) c.status = "Active";
    }
  });

  // Generate test takers (~1000+) and admissions (~100+)
  const activeWithLeads = consultants.filter((c) => c.leadsCount > 0);
  let tt = 0;
  let ad = 0;
  activeWithLeads.forEach((c) => {
    const cLeads = leads.filter((l) => l.consultantId === c.id);
    const ttTarget = Math.max(1, Math.floor(c.leadsCount * 0.22));
    const adTarget = Math.max(0, Math.floor(ttTarget * 0.12));
    for (let i = 0; i < ttTarget && tt < 1200; i++) {
      const lead = cLeads[i % cLeads.length]!;
      const tid = uid("tt");
      testTakers.push({
        id: tid,
        consultantId: c.id,
        leadId: lead.id,
        name: lead.name,
        examDate: addDays(lead.createdAt, 14).slice(0, 10),
        source: "Existing Exam System",
      });
      tt++;
    }
    for (let i = 0; i < adTarget && ad < 140; i++) {
      const lead = cLeads[i % cLeads.length]!;
      admissions.push({
        id: uid("adm"),
        consultantId: c.id,
        leadId: lead.id,
        name: lead.name,
        admittedAt: addDays(lead.createdAt, 45).slice(0, 10),
        source: "Existing Admission System",
      });
      ad++;
    }
    c.testTakersCount = testTakers.filter((t) => t.consultantId === c.id).length;
    c.admissionsCount = admissions.filter((a) => a.consultantId === c.id).length;
  });

  while (testTakers.length < 1050) {
    const c = pick(rng, activeWithLeads);
    const lead = pick(rng, leads.filter((l) => l.consultantId === c.id));
    testTakers.push({
      id: uid("tt"),
      consultantId: c.id,
      leadId: lead.id,
      name: lead.name,
      examDate: isoDaysAgo(rng, 60).slice(0, 10),
      source: "Existing Exam System",
    });
    c.testTakersCount += 1;
  }

  while (admissions.length < 110) {
    const c = pick(rng, activeWithLeads);
    const lead = pick(rng, leads.filter((l) => l.consultantId === c.id));
    admissions.push({
      id: uid("adm"),
      consultantId: c.id,
      leadId: lead.id,
      name: lead.name,
      admittedAt: isoDaysAgo(rng, 40).slice(0, 10),
      source: "Existing Admission System",
    });
    c.admissionsCount += 1;
  }

  const mergeRequests: MergeRequest[] = [
    {
      id: "mrg_001",
      primaryId: consultants[0]!.id,
      duplicateId: consultants[1]!.id,
      requestedBy: b2bMembers[0]!.id,
      status: "Pending",
      reason: "Same phone & organization",
      createdAt: isoDaysAgo(rng, 3),
    },
  ];

  const weeklyReports: WeeklyReport[] = [];
  for (let w = 0; w < 6; w++) {
    const end = new Date();
    end.setDate(end.getDate() - w * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    weeklyReports.push({
      id: uid("wr"),
      weekStart: start.toISOString().slice(0, 10),
      weekEnd: end.toISOString().slice(0, 10),
      status: w === 0 ? "Ready" : w === 1 ? "Reviewed" : "Reviewed",
      meetings: 40 + Math.floor(rng() * 30),
      newConsultants: 5 + Math.floor(rng() * 10),
      mouRequests: 4 + Math.floor(rng() * 8),
      mouSigned: 2 + Math.floor(rng() * 5),
      activeConsultants: consultants.filter((c) => c.status === "Active").length,
      leads: 800 + Math.floor(rng() * 400),
      testTakers: 150 + Math.floor(rng() * 80),
      admissions: 12 + Math.floor(rng() * 20),
      exceptions: {
        mouOverSla: 1 + Math.floor(rng() * 4),
        withoutOwner: Math.floor(rng() * 2),
        unmappedUtms: Math.floor(rng() * 3),
        missingDocuments: 2 + Math.floor(rng() * 5),
        other: Math.floor(rng() * 3),
      },
      createdAt: end.toISOString(),
      reviewedBy: w > 0 ? members.find((m) => m.role === "Operations")?.id : undefined,
      reviewedAt: w > 0 ? end.toISOString() : undefined,
    });
  }

  const userTargets: UserTargets[] = b2bMembers.map((m, i) => ({
    userId: m.id,
    schools: 8 + Math.floor(rng() * 12) + (i % 3),
    consultants: 10 + Math.floor(rng() * 15) + (i % 4),
    meetings: 20 + Math.floor(rng() * 30) + (i % 5),
    coachings: 6 + Math.floor(rng() * 10) + (i % 3),
    updatedAt: new Date().toISOString(),
  }));

  return {
    members,
    consultants,
    meetings,
    events,
    mous,
    utms,
    coupons,
    leads,
    testTakers,
    admissions,
    ownership,
    documents,
    mergeRequests,
    activities,
    weeklyReports,
    userTargets,
  };
}
