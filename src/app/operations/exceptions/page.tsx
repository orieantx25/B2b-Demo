"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Kpi, PageHeader } from "@/components/ui";

export default function ExceptionsPage() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const utms = useAppStore((s) => s.utms);
  const documents = useAppStore((s) => s.documents);

  const ex = useMemo(() => {
    const overSla = mous.filter((m) => m.status !== "Signed" && new Date(m.slaDueAt) < new Date());
    const withoutOwner = consultants.filter((c) => !c.ownerId);
    const unmapped = utms.filter((u) => !u.consultantId);
    const missingDocs = documents.filter((d) => d.status === "Missing" || d.verification === "Missing");
    return { overSla, withoutOwner, unmapped, missingDocs };
  }, [mous, consultants, utms, documents]);

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Exceptions" subtitle="Exception-based ops — not manual compilation." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="MOU over SLA" value={ex.overSla.length} tone="red" />
        <Kpi label="Without owner" value={ex.withoutOwner.length} tone="amber" />
        <Kpi label="Unmapped UTMs" value={ex.unmapped.length} tone="violet" />
        <Kpi label="Missing documents" value={ex.missingDocs.length} tone="amber" />
      </div>
      <div className="mt-6 card-surface">
        <div className="border-b px-4 py-3 text-sm font-semibold">MOU over SLA</div>
        <ul className="divide-y divide-[#e5e5e5]">
          {ex.overSla.slice(0, 15).map((m) => {
            const c = consultants.find((x) => x.id === m.consultantId);
            return (
              <li key={m.id} className="px-4 py-2 text-sm">
                {c?.name} · {m.status}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
