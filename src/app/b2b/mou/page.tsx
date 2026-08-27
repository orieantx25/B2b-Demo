"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, Kpi, KpiSection, PageHeader, StatusTone } from "@/components/ui";
import { MouLifecycle } from "@/components/journey";
import { formatDate } from "@/lib/utils";

export default function B2BMouPage() {
  const router = useRouter();
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);

  const rows = useMemo(
    () =>
      mous.filter((m) => {
        const c = consultants.find((x) => x.id === m.consultantId);
        if (persona === "b2b") return c?.ownerId === currentUserId;
        return true;
      }),
    [mous, consultants, persona, currentUserId]
  );

  const summary = useMemo(() => {
    const count = (pred: (s: string) => boolean) => rows.filter((m) => pred(m.status)).length;
    return {
      total: rows.length,
      requested: count((s) => s === "Requested"),
      verification: count((s) => s === "Verification"),
      rework: count((s) => s === "Rework"),
      inProgress: count((s) =>
        ["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Legal Review", "Finance Approval"].includes(s)
      ),
      signed: count((s) => s === "Signed"),
    };
  }, [rows]);

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader
        title="MOU / WO"
        subtitle="Your consultant MOU pipeline — rework shows as Action required."
      />

      <KpiSection title="My MOU status">
        <Kpi label="Total" value={summary.total} tone="ink" />
        <Kpi label="Requested" value={summary.requested} tone="blue" />
        <Kpi label="Verification" value={summary.verification} tone="violet" />
        <Kpi
          label="Rework"
          value={summary.rework}
          tone="amber"
          hint={summary.rework ? "Action required" : "All clear"}
        />
        <Kpi label="In progress" value={summary.inProgress} tone="blue" hint="WO · signature · approvals" />
        <Kpi label="Signed" value={summary.signed} tone="green" />
      </KpiSection>

      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-[3px] shrink-0 rounded-full bg-[#e31c24]" />
        <h2 className="section-title text-[1.05rem] text-[#111111]">Requests</h2>
        <span className="text-xs text-[#6b6b6b] tabular-nums">{rows.length} shown</span>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && (
          <EmptyState
            title="No MOU requests yet"
            description="Request an MOU from a consultant 360 after a completed meeting."
            action={
              <Link href="/b2b/consultants">
                <Button>My Consultants</Button>
              </Link>
            }
          />
        )}
        {rows.slice(0, 40).map((m) => {
          const c = consultants.find((x) => x.id === m.consultantId);
          return (
            <div key={m.id} className="card-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <Link
                  href={`/consultants/${m.consultantId}`}
                  className="font-semibold text-[#111111] hover:text-[#e31c24]"
                >
                  {c?.name}
                </Link>
                <div className="flex gap-2">
                  <Badge tone={StatusTone(m.status)}>
                    {m.status === "Rework" ? "Action required" : m.status}
                  </Badge>
                  <Badge tone={m.commercialType === "Standard" ? "lime" : "warn"}>
                    {m.commercialType}
                  </Badge>
                </div>
              </div>
              <MouLifecycle status={m.status} />
              {m.status === "Rework" && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-[#f0d2ad] bg-[#fff4e8] p-3 text-sm">
                  <div>
                    <div className="font-medium text-[#111111]">{m.reworkMessage}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      Fix: {(m.reworkItems || []).join(", ")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/consultants/${m.consultantId}`)}
                  >
                    Fix rework — upload docs
                  </Button>
                </div>
              )}
              <div className="mt-2 text-xs text-[#6b6b6b]">Updated {formatDate(m.updatedAt)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
