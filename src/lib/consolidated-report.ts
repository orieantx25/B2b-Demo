import * as XLSX from "xlsx";
import type {
  Admission,
  Consultant,
  Coupon,
  Lead,
  Meeting,
  MouRequest,
  TestTaker,
  UtmRecord,
  WeeklyReport,
  B2BMember,
  UserTargets,
} from "@/types";

export type ConsolidatedSource = {
  members: B2BMember[];
  consultants: Consultant[];
  meetings: Meeting[];
  mous: MouRequest[];
  utms: UtmRecord[];
  coupons: Coupon[];
  leads: Lead[];
  testTakers: TestTaker[];
  admissions: Admission[];
  weeklyReports: WeeklyReport[];
  userTargets: UserTargets[];
};

function ownerName(members: B2BMember[], ownerId: string) {
  return members.find((m) => m.id === ownerId)?.name || ownerId;
}

export function buildConsolidatedSheets(data: ConsolidatedSource) {
  const summary = [
    { metric: "Meetings", value: data.meetings.length },
    { metric: "Consultants", value: data.consultants.length },
    { metric: "Active consultants", value: data.consultants.filter((c) => c.status === "Active").length },
    { metric: "MOU requests", value: data.mous.length },
    { metric: "MOU signed", value: data.mous.filter((m) => m.status === "Signed").length },
    { metric: "UTMs", value: data.utms.length },
    { metric: "Coupons", value: data.coupons.length },
    { metric: "Leads", value: data.leads.length },
    { metric: "Test takers", value: data.testTakers.length },
    { metric: "Admissions", value: data.admissions.length },
  ];

  const consultants = data.consultants.map((c) => ({
    consultantId: c.id,
    consultantCode: c.consultantCode,
    name: c.name,
    organization: c.organization,
    region: c.region,
    status: c.status,
    mouStatus: c.mouStatus,
    utmStatus: c.utmStatus,
    owner: ownerName(data.members, c.ownerId),
    leads: c.leadsCount,
    testTakers: c.testTakersCount,
    admissions: c.admissionsCount,
    materialsSharedAt: c.materialsSharedAt || "",
  }));

  const meetings = data.meetings.map((m) => ({
    meetingId: m.id,
    consultantName: m.consultantName,
    consultantId: m.consultantId || "",
    date: m.date,
    time: m.time,
    type: m.type,
    status: m.status,
    owner: ownerName(data.members, m.ownerId),
    location: m.location || "",
  }));

  const mous = data.mous.map((m) => {
    const c = data.consultants.find((x) => x.id === m.consultantId);
    return {
      mouId: m.id,
      consultant: c?.name || "",
      consultantCode: c?.consultantCode || "",
      status: m.status,
      commercialType: m.commercialType,
      slab: m.slab || "",
      woNumber: m.woNumber || "",
      sentToLegalAt: m.opsTrack?.sentToLegalAt || "",
      financeApprovedAt: m.opsTrack?.financeApprovedAt || "",
      draftSharedAt: m.opsTrack?.draftSharedAt || "",
      sentToClientAt: m.opsTrack?.sentToClientAt || m.woSentAt || "",
      signedAt: m.signedAt || "",
      slaDueAt: m.slaDueAt,
    };
  });

  const targets = data.userTargets.map((t) => {
    const m = data.members.find((x) => x.id === t.userId);
    return {
      userId: t.userId,
      name: m?.name || "",
      role: m?.role || "",
      schools: t.schools,
      consultants: t.consultants,
      meetings: t.meetings,
      coachings: t.coachings,
      updatedAt: t.updatedAt,
    };
  });

  const weekly = data.weeklyReports.map((r) => ({
    weekStart: r.weekStart,
    weekEnd: r.weekEnd,
    status: r.status,
    meetings: r.meetings,
    leads: r.leads,
    admissions: r.admissions,
    mouSigned: r.mouSigned,
    activeConsultants: r.activeConsultants,
    slaExceptions: r.exceptions.mouOverSla,
    withoutOwner: r.exceptions.withoutOwner,
    unmappedUtms: r.exceptions.unmappedUtms,
    missingDocuments: r.exceptions.missingDocuments,
  }));

  const utms = data.utms.map((u) => {
    const c = data.consultants.find((x) => x.id === u.consultantId);
    return {
      code: u.code,
      counsellorCode: u.counsellorCode || "",
      consultant: c?.name || "",
      consultantCode: c?.consultantCode || "",
      status: u.status,
      createdAt: u.createdAt,
    };
  });

  const coupons = data.coupons.map((cp) => {
    const c = data.consultants.find((x) => x.id === cp.consultantId);
    return {
      code: cp.code,
      for: cp.createdFor,
      consultant: c?.name || "",
      status: cp.status,
      createdAt: cp.createdAt,
    };
  });

  return {
    Summary: summary,
    Consultants: consultants,
    Meetings: meetings,
    MOU: mous,
    Targets: targets,
    Weekly: weekly,
    UTM: utms,
    Coupons: coupons,
  };
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadConsolidatedCsv(data: ConsolidatedSource) {
  const sheets = buildConsolidatedSheets(data);
  const parts: string[] = [];
  for (const [name, rows] of Object.entries(sheets)) {
    parts.push(`# ${name}`);
    if (!rows.length) {
      parts.push("(empty)");
      parts.push("");
      continue;
    }
    const keys = Object.keys(rows[0]!);
    parts.push(keys.join(","));
    for (const row of rows) {
      parts.push(
        keys
          .map((k) => {
            const v = String((row as Record<string, unknown>)[k] ?? "");
            return `"${v.replace(/"/g, '""')}"`;
          })
          .join(",")
      );
    }
    parts.push("");
  }
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(
    `ugsot-consolidated-report-${stamp}.csv`,
    new Blob([parts.join("\n")], { type: "text/csv;charset=utf-8" })
  );
}

export function downloadConsolidatedXlsx(data: ConsolidatedSource) {
  const sheets = buildConsolidatedSheets(data);
  const wb = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  downloadBlob(
    `ugsot-consolidated-report-${stamp}.xlsx`,
    new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })
  );
}
