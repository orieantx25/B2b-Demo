"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Kpi, KpiSection, PageHeader, Panel, StatusTone } from "@/components/ui";

export default function OpsOverview() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const mergeRequests = useAppStore((s) => s.mergeRequests);

  const kpis = useMemo(() => {
    const open = mous.filter((m) => m.status !== "Signed");
    return {
      open: open.length,
      needs: mous.filter((m) => ["Requested", "Verification", "Rework"].includes(m.status)).length,
      sla: mous.filter((m) => m.status !== "Signed" && new Date(m.slaDueAt) < new Date()).length,
      rework: mous.filter((m) => m.status === "Rework").length,
      awaitSig: mous.filter((m) => m.status === "Awaiting Signature").length,
      signed: mous.filter((m) => m.status === "Signed").length,
    };
  }, [mous]);

  const queue = useMemo(() => {
    return mous
      .filter((m) =>
        ["Requested", "Verification", "Rework", "Approved", "WO Generated", "Awaiting Signature"].includes(
          m.status
        )
      )
      .sort((a, b) => {
        const aOver = new Date(a.slaDueAt) < new Date() ? 0 : 1;
        const bOver = new Date(b.slaDueAt) < new Date() ? 0 : 1;
        if (aOver !== bOver) return aOver - bOver;
        return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime();
      })
      .slice(0, 12);
  }, [mous]);

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader title="Operations Overview" subtitle="What needs my attention?" />
      <KpiSection title="Queue health">
        <Kpi label="Open requests" value={kpis.open} tone="blue" href="/operations/queue" />
        <Kpi
          label="Needs action"
          value={kpis.needs}
          tone="amber"
          hint={kpis.open ? `${Math.round((kpis.needs / kpis.open) * 100)}% of open` : undefined}
          href="/operations/queue?status=action"
        />
        <Kpi label="SLA risk" value={kpis.sla} tone="red" href="/operations/queue?sla=over" />
        <Kpi label="Rework" value={kpis.rework} tone="violet" href="/operations/queue?status=Rework" />
        <Kpi
          label="Awaiting signature"
          value={kpis.awaitSig}
          tone="amber"
          href="/operations/queue?status=Awaiting%20Signature"
        />
        <Kpi label="Signed" value={kpis.signed} tone="green" href="/operations/signed" />
      </KpiSection>

      <div className="mt-2 grid gap-3 lg:grid-cols-3">
        <Panel
          title="Action queue"
          className="lg:col-span-2"
          action={
            <Link href="/operations/queue" className="text-xs font-semibold text-[#6b6b6b] underline">
              Full queue
            </Link>
          }
        >
          <ul className="divide-y divide-[#e5e5e5]">
            {queue.map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              const over = new Date(m.slaDueAt) < new Date() && m.status !== "Signed";
              return (
                <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <Link
                      href={`/operations/verification?id=${m.id}`}
                      className="text-sm font-semibold text-[#111111] hover:text-[#e31c24]"
                    >
                      {c?.name}
                    </Link>
                    <div className="text-xs text-[#6b6b6b]">
                      {m.commercialType}
                      {m.slab ? ` · ${m.slab}` : ""} {over ? "· SLA risk" : ""}
                    </div>
                  </div>
                  <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                </li>
              );
            })}
          </ul>
        </Panel>
        <Panel title="Merge requests">
          <ul className="divide-y divide-[#e5e5e5]">
            {mergeRequests
              .filter((m) => m.status === "Pending")
              .map((m) => (
                <li key={m.id} className="px-4 py-3 text-sm">
                  <Link href="/operations/ownership" className="font-semibold text-[#111111] hover:text-[#e31c24]">
                    Pending merge
                  </Link>
                  <div className="text-xs text-[#6b6b6b]">{m.reason}</div>
                </li>
              ))}
            {mergeRequests.filter((m) => m.status === "Pending").length === 0 && (
              <li className="px-4 py-6 text-sm text-[#6b6b6b]">No pending merges</li>
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
