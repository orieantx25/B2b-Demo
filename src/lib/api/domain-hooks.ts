"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  completeMeetingAction,
  requestMouAction,
  scheduleMeetingAction,
} from "@/app/actions/domain";
import { useAppStore } from "@/store/app-store";

export function useDomainSnapshot(enabled = true) {
  return useQuery({
    queryKey: ["domain"],
    enabled,
    queryFn: async () => {
      const res = await fetch("/api/domain");
      if (!res.ok) throw new Error("Failed to load domain");
      return res.json();
    },
  });
}

export function useScheduleMeeting() {
  const qc = useQueryClient();
  const scheduleMeeting = useAppStore((s) => s.scheduleMeeting);
  return useMutation({
    mutationFn: async (
      input: Parameters<typeof scheduleMeetingAction>[0]
    ) => {
      const id = scheduleMeeting(input);
      try {
        await scheduleMeetingAction(input);
      } catch {
        /* local store already updated for UX */
      }
      return id;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["domain"] });
    },
  });
}

export function useCompleteMeeting() {
  const qc = useQueryClient();
  const completeMeeting = useAppStore((s) => s.completeMeeting);
  return useMutation({
    mutationFn: async (meetingId: string) => {
      completeMeeting(meetingId);
      try {
        await completeMeetingAction(meetingId);
      } catch {
        /* noop */
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["domain"] }),
  });
}

export function useRequestMou() {
  const qc = useQueryClient();
  const requestMou = useAppStore((s) => s.requestMou);
  return useMutation({
    mutationFn: async (input: {
      consultantId: string;
      meetingId: string;
      commercialType: "Standard" | "Non-Standard";
      slab?: "Standard Slab A" | "Standard Slab B" | "Standard Slab C";
      notes?: string;
    }) => {
      requestMou(input);
      try {
        await requestMouAction(input);
      } catch {
        /* noop */
      }
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["domain"] }),
  });
}

export function useConsultantsQuery() {
  const consultants = useAppStore((s) => s.consultants);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);
  return useQuery({
    queryKey: ["consultants", currentUserId, persona, consultants.length],
    queryFn: async () => {
      if (persona === "b2b") {
        return consultants.filter((c) => c.ownerId === currentUserId);
      }
      return consultants;
    },
    initialData: () =>
      persona === "b2b" ? consultants.filter((c) => c.ownerId === currentUserId) : consultants,
  });
}
