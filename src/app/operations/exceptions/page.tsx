"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, EmptyState, Kpi, PageHeader, StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/utils";

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
        <Kpi
          label="MOU over SLA"
          value={ex.overSla.length}
          tone="red"
          href="/operations/queue?sla=over"
        />
        <Kpi
          label="Without owner"
          value={ex.withoutOwner.length}
          tone="amber"
          href="/operations/ownership"
        />
        <Kpi label="Unmapped UTMs" value={ex.unmapped.length} tone="violet" href="/operations/utm" />
        <Kpi
          label="Missing documents"
          value={ex.missingDocs.length}
          tone="amber"
          href="/operations/queue?status=action"
        />
      </div>

      <div className="mt-6 space-y-4">
        <section className="card-surface">
          <div className="border-b px-4 py-3 text-sm font-semibold">MOU over SLA</div>
          {ex.overSla.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#6b6b6b]">No SLA breaches</div>
          ) : (
            <ul className="divide-y divide-[#e5e5e5]">
              {ex.overSla.slice(0, 15).map((m) => {
                const c = consultants.find((x) => x.id === m.consultantId);
                return (
                  <li key={m.id}>
                    <Link
                      href={`/operations/verification?id=${m.id}`}
                      className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-[#fafafa]"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{c?.name}</div>
                        <div className="text-xs text-[#6b6b6b]">Due {formatDate(m.slaDueAt)}</div>
                      </div>
                      <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="card-surface">
          <div className="border-b px-4 py-3 text-sm font-semibold">Without owner</div>
          {ex.withoutOwner.length === 0 ? (
            <div className="px-4 py-6 text-sm text-[#6b6b6b]">All consultants have owners</div>
          ) : (
            <ul className="divide-y divide-[#e5e5e5]">
              {ex.withoutOwner.slice(0, 10).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/consultants/${c.id}`}
                    className="block px-4 py-3 text-sm font-semibold hover:bg-[#fafafa]"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {ex.overSla.length === 0 &&
          ex.withoutOwner.length === 0 &&
          ex.unmapped.length === 0 &&
          ex.missingDocs.length === 0 && (
            <EmptyState title="No exceptions" description="Ops queue is healthy." />
          )}
      </div>
    </div>
  );
}
