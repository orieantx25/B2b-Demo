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
    const needsYou = rows.filter((m) =>
      ["Rework", "Requested", "Verification"].includes(m.status)
    ).length;
    const inProgress = rows.filter((m) =>
      [
        "Approved",
        "WO Generated",
        "WO Sent",
        "Awaiting Signature",
        "Legal Review",
        "Finance Approval",
      ].includes(m.status)
    ).length;
    const signed = rows.filter((m) => m.status === "Signed").length;
    return { needsYou, inProgress, signed, total: rows.length };
  }, [rows]);

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader
        title="MOU / WO"
        subtitle="Needs you · In progress · Signed — one action per request."
      />

      <KpiSection title="Status">
        <Kpi
          label="Needs you"
          value={summary.needsYou}
          tone="amber"
          hint="Rework · requested · verification"
        />
        <Kpi label="In progress" value={summary.inProgress} tone="blue" hint="WO · signature · approvals" />
        <Kpi label="Signed" value={summary.signed} tone="green" />
      </KpiSection>

      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-[3px] shrink-0 rounded-full bg-[#e31c24]" />
        <h2 className="section-title text-[1.05rem] text-[#111111]">Requests</h2>
        <span className="text-xs text-[#6b6b6b] tabular-nums">{summary.total}</span>
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
          const isRework = m.status === "Rework";
          return (
            <div key={m.id} className="card-surface p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold text-[#111111]">{c?.name}</div>
                  <div className="text-xs text-[#6b6b6b]">Updated {formatDate(m.updatedAt)}</div>
                </div>
                <Badge tone={StatusTone(m.status)}>
                  {isRework ? "Action required" : m.status}
                </Badge>
              </div>
              <MouLifecycle status={m.status} />
              {isRework && m.reworkMessage && (
                <p className="mt-2 text-sm text-[#b45309]">{m.reworkMessage}</p>
              )}
              <div className="mt-3">
                <Button
                  size="sm"
                  onClick={() => router.push(`/consultants/${m.consultantId}`)}
                >
                  {isRework ? "Fix rework" : "Open 360"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
