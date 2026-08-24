import { useAppStore } from "@/store/app-store";

export function memberName(id: string) {
  return useAppStore.getState().members.find((m) => m.id === id)?.name || id;
}

export function consultantById(id: string) {
  return useAppStore.getState().consultants.find((c) => c.id === id);
}

export function getKpis() {
  const s = useAppStore.getState();
  return {
    meetings: s.meetings.length,
    consultants: s.consultants.length,
    activeConsultants: s.consultants.filter((c) => c.status === "Active").length,
    mouRequests: s.mous.length,
    mouSigned: s.mous.filter((m) => m.status === "Signed").length,
    leads: s.leads.length,
    testTakers: s.testTakers.length,
    admissions: s.admissions.length,
    openRequests: s.mous.filter((m) => !["Signed"].includes(m.status)).length,
    needsAction: s.mous.filter((m) => ["Requested", "Verification", "Rework"].includes(m.status)).length,
    slaRisk: s.mous.filter((m) => new Date(m.slaDueAt) < new Date() && m.status !== "Signed").length,
    rework: s.mous.filter((m) => m.status === "Rework").length,
    awaitingSignature: s.mous.filter((m) => m.status === "Awaiting Signature").length,
  };
}
