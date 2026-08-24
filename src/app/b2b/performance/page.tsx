"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Kpi, KpiSection, PageHeader } from "@/components/ui";

export default function B2BPerformancePage() {
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const leads = useAppStore((s) => s.leads);
  const admissions = useAppStore((s) => s.admissions);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const mine = useMemo(() => consultants.filter((c) => c.ownerId === currentUserId), [consultants, currentUserId]);
  const ids = new Set(mine.map((c) => c.id));
  const myMeetings = meetings.filter((m) => m.ownerId === currentUserId).length;
  const active = mine.filter((c) => c.status === "Active").length;
  const myLeads = leads.filter((l) => ids.has(l.consultantId)).length;
  const myAdmissions = admissions.filter((a) => ids.has(a.consultantId)).length;

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader title="My Performance" subtitle="Your contribution to the consultant lifecycle." />
      <KpiSection title="My outcomes">
        <Kpi label="Meetings" value={myMeetings} tone="blue" />
        <Kpi label="Consultants" value={mine.length} tone="violet" />
        <Kpi
          label="Active"
          value={active}
          tone="green"
          hint={mine.length ? `${Math.round((active / mine.length) * 100)}% of consultants` : undefined}
        />
        <Kpi label="Leads" value={myLeads} tone="blue" />
        <Kpi
          label="Admissions"
          value={myAdmissions}
          tone="red"
          hint={myLeads ? `${Math.round((myAdmissions / myLeads) * 100)}% of leads` : undefined}
        />
        <Kpi label="Avg leads / consultant" value={mine.length ? Math.round(myLeads / mine.length) : 0} tone="amber" />
      </KpiSection>
    </div>
  );
}
