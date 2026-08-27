"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Kpi, KpiSection, PageHeader, Panel } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function B2BPerformancePage() {
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const leads = useAppStore((s) => s.leads);
  const admissions = useAppStore((s) => s.admissions);
  const mous = useAppStore((s) => s.mous);
  const currentUserId = useAppStore((s) => s.currentUserId);

  const mine = useMemo(
    () => consultants.filter((c) => c.ownerId === currentUserId),
    [consultants, currentUserId]
  );
  const ids = new Set(mine.map((c) => c.id));
  const myMeetings = meetings.filter((m) => m.ownerId === currentUserId);
  const active = mine.filter((c) => c.status === "Active");
  const myLeads = leads.filter((l) => ids.has(l.consultantId)).length;
  const myAdmissions = admissions.filter((a) => ids.has(a.consultantId)).length;
  const rework = mous.filter(
    (m) => m.status === "Rework" && ids.has(m.consultantId)
  );
  const needsPhoto = myMeetings
    .filter((m) => !m.photoUrl && m.status !== "Cancelled")
    .slice(0, 5);

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader title="My Performance" subtitle="Your contribution to the consultant lifecycle." />
      <KpiSection title="My outcomes">
        <Kpi label="Meetings" value={myMeetings.length} tone="blue" href="/b2b/meetings" />
        <Kpi label="Consultants" value={mine.length} tone="violet" href="/b2b/consultants" />
        <Kpi
          label="Active"
          value={active.length}
          tone="green"
          hint={
            mine.length ? `${Math.round((active.length / mine.length) * 100)}% of consultants` : undefined
          }
          href="/b2b/consultants"
        />
        <Kpi label="Leads" value={myLeads} tone="blue" />
        <Kpi
          label="Admissions"
          value={myAdmissions}
          tone="red"
          hint={myLeads ? `${Math.round((myAdmissions / myLeads) * 100)}% of leads` : undefined}
        />
        <Kpi
          label="Avg leads / consultant"
          value={mine.length ? Math.round(myLeads / mine.length) : 0}
          tone="amber"
        />
      </KpiSection>

      <div className="mt-2 grid gap-3 lg:grid-cols-2">
        <Panel title="What to do next">
          <ul className="divide-y divide-[#e5e5e5]">
            {rework.length === 0 && needsPhoto.length === 0 && (
              <li className="px-4 py-6 text-sm text-[#6b6b6b]">All clear — keep scheduling.</li>
            )}
            {rework.slice(0, 4).map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              return (
                <li key={m.id}>
                  <Link
                    href={`/consultants/${m.consultantId}`}
                    className="block px-4 py-3 text-sm hover:bg-[#fafafa]"
                  >
                    <div className="font-semibold">Fix rework · {c?.name}</div>
                    <div className="text-xs text-[#6b6b6b]">{m.reworkMessage || "Action required"}</div>
                  </Link>
                </li>
              );
            })}
            {needsPhoto.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/b2b/meetings?photo=${m.id}`}
                  className="block px-4 py-3 text-sm hover:bg-[#fafafa]"
                >
                  <div className="font-semibold">Add field photo · {m.consultantName}</div>
                  <div className="text-xs text-[#6b6b6b]">{formatDate(m.date)}</div>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Active consultants">
          <ul className="divide-y divide-[#e5e5e5]">
            {active.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/consultants/${c.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-[#fafafa]"
                >
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-xs text-[#6b6b6b]">{c.leadsCount} leads</span>
                </Link>
              </li>
            ))}
            {active.length === 0 && (
              <li className="px-4 py-6 text-sm text-[#6b6b6b]">No active consultants yet</li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
