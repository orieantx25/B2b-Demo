/** Service abstractions — mock now, swap for APIs later */

import { useAppStore } from "@/store/app-store";

export const consultantService = {
  list: () => useAppStore.getState().consultants,
  get: (id: string) => useAppStore.getState().consultants.find((c) => c.id === id),
  create: (...args: Parameters<ReturnType<typeof useAppStore.getState>["createConsultant"]>) =>
    useAppStore.getState().createConsultant(...args),
  findDuplicates: (...args: Parameters<ReturnType<typeof useAppStore.getState>["findDuplicates"]>) =>
    useAppStore.getState().findDuplicates(...args),
};

export const meetingService = {
  list: () => useAppStore.getState().meetings,
  schedule: (...args: Parameters<ReturnType<typeof useAppStore.getState>["scheduleMeeting"]>) =>
    useAppStore.getState().scheduleMeeting(...args),
  complete: (id: string) => useAppStore.getState().completeMeeting(id),
};

export const mouService = {
  list: () => useAppStore.getState().mous,
  request: (...args: Parameters<ReturnType<typeof useAppStore.getState>["requestMou"]>) =>
    useAppStore.getState().requestMou(...args),
  approve: (id: string) => useAppStore.getState().approveMou(id),
  rework: (...args: Parameters<ReturnType<typeof useAppStore.getState>["requestRework"]>) =>
    useAppStore.getState().requestRework(...args),
};

export const utmService = {
  list: () => useAppStore.getState().utms,
  forConsultant: (id: string) => useAppStore.getState().utms.filter((u) => u.consultantId === id),
  request: (id: string) => useAppStore.getState().requestUtm(id),
};

export const reportService = {
  list: () => useAppStore.getState().weeklyReports,
  markReviewed: (id: string) => useAppStore.getState().markReportReviewed(id),
};

export const ownershipService = {
  history: (consultantId: string) =>
    useAppStore.getState().ownership.filter((o) => o.consultantId === consultantId),
  transfer: (...args: Parameters<ReturnType<typeof useAppStore.getState>["transferOwnership"]>) =>
    useAppStore.getState().transferOwnership(...args),
};
