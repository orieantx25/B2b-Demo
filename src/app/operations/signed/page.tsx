"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, PageHeader, StatusTone } from "@/components/ui";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import type { MouRequest } from "@/types";

const MILESTONES: {
  key: "sentToLegal" | "financeApproved" | "draftShared" | "sentToClient" | "signed";
  label: string;
  auto?: boolean;
  mark?: "financeApproved" | "draftShared" | "sentToClient" | "signed";
}[] = [
  { key: "sentToLegal", label: "MoU sent to legal", auto: true },
  { key: "financeApproved", label: "Approved by finance", mark: "financeApproved" },
  { key: "draftShared", label: "Draft shared", mark: "draftShared" },
  { key: "sentToClient", label: "WO / MoU sent to client", mark: "sentToClient" },
  { key: "signed", label: "WO / MoU signed", mark: "signed" },
];

function milestoneDone(m: MouRequest, key: (typeof MILESTONES)[number]["key"]) {
  if (key === "sentToLegal") return !!(m.opsTrack?.sentToLegalAt || m.approvedAt);
  if (key === "financeApproved") return !!m.opsTrack?.financeApprovedAt;
  if (key === "draftShared") return !!m.opsTrack?.draftSharedAt;
  if (key === "sentToClient") return !!(m.opsTrack?.sentToClientAt || m.woSentAt);
  if (key === "signed") return m.status === "Signed" || !!m.signedAt;
  return false;
}

function milestoneAt(m: MouRequest, key: (typeof MILESTONES)[number]["key"]) {
  if (key === "sentToLegal") return m.opsTrack?.sentToLegalAt || m.approvedAt;
  if (key === "financeApproved") return m.opsTrack?.financeApprovedAt;
  if (key === "draftShared") return m.opsTrack?.draftSharedAt;
  if (key === "sentToClient") return m.opsTrack?.sentToClientAt || m.woSentAt;
  if (key === "signed") return m.signedAt;
  return undefined;
}

function ApprovedTrackingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const focusId = search.get("id");
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const markOpsMilestone = useAppStore((s) => s.markOpsMilestone);
  const persona = useAppStore((s) => s.persona);
  const canMark = persona === "operations" || persona === "admin";

  const approved = useMemo(
    () =>
      mous
        .filter((m) =>
          ["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed", "Legal Review", "Finance Approval"].includes(
            m.status
          )
        )
        .sort((a, b) => (b.approvedAt || b.updatedAt).localeCompare(a.approvedAt || a.updatedAt)),
    [mous]
  );

  const [selectedId, setSelectedId] = useState(focusId || approved[0]?.id || "");

  useEffect(() => {
    if (focusId) setSelectedId(focusId);
  }, [focusId]);

  const mou = approved.find((m) => m.id === selectedId) || approved[0];
  const c = mou ? consultants.find((x) => x.id === mou.consultantId) : undefined;
  const owner = c ? members.find((m) => m.id === c.ownerId) : undefined;

  const select = (id: string) => {
    setSelectedId(id);
    router.replace(`/operations/signed?id=${id}`, { scroll: false });
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Approved tracking"
        subtitle="Approved / in-flight consultants. Ops marks post-legal steps; B2B sees them on the journey."
      />

      {approved.length === 0 ? (
        <EmptyState
          title="No approved MOUs yet"
          description="Approve from the MOU / WO queue verification panel."
          action={
            <Link href="/operations/queue">
              <Button>Open queue</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="card-surface max-h-[70vh] overflow-y-auto">
            <div className="border-b border-[#e5e5e5] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b]">
              Approved · {approved.length}
            </div>
            <ul className="divide-y divide-[#e5e5e5]">
              {approved.map((m) => {
                const cc = consultants.find((x) => x.id === m.consultantId);
                const active = m.id === mou?.id;
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => select(m.id)}
                      className={cn(
                        "w-full px-3 py-3 text-left hover:bg-[#fafafa]",
                        active && "bg-[#fdecec]"
                      )}
                    >
                      <div className="truncate text-sm font-semibold">{cc?.name}</div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                        {m.woNumber && (
                          <span className="font-mono text-[10px] text-[#6b6b6b]">{m.woNumber}</span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {mou && c ? (
            <div className="card-surface p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-[#111]">{c.name}</h2>
                  <p className="mt-0.5 text-sm text-[#6b6b6b]">
                    {c.organization} · {c.consultantCode}
                    {owner ? ` · SPOC ${owner.name}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[#6b6b6b]">
                    Approved {mou.approvedAt ? formatDate(mou.approvedAt) : "—"} · {mou.commercialType}
                    {mou.slab ? ` · ${mou.slab}` : ""}
                  </p>
                </div>
                <Link href={`/consultants/${c.id}`}>
                  <Button size="sm" variant="outline">
                    Open 360
                  </Button>
                </Link>
              </div>

              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
                Ops milestones {canMark ? "(mark)" : "(view only)"}
              </div>
              <ol className="space-y-0">
                {MILESTONES.map((step, i) => {
                  const done = milestoneDone(mou, step.key);
                  const at = milestoneAt(mou, step.key);
                  const prevDone =
                    i === 0 || milestoneDone(mou, MILESTONES[i - 1]!.key);
                  const canClick = canMark && !done && !step.auto && prevDone && step.mark;
                  return (
                    <li key={step.key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                            done ? "bg-[#e31c24] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]"
                          )}
                        >
                          {i + 1}
                        </div>
                        {i < MILESTONES.length - 1 && (
                          <div
                            className={cn(
                              "w-0.5 flex-1 min-h-[28px]",
                              done ? "bg-[#e31c24]" : "bg-[#e5e5e5]"
                            )}
                          />
                        )}
                      </div>
                      <div className="flex flex-1 flex-wrap items-center justify-between gap-2 pb-4 pt-1">
                        <div>
                          <div className={cn("text-sm font-semibold", done ? "text-[#111]" : "text-[#6b6b6b]")}>
                            {step.label}
                            {step.auto && (
                              <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-[#6b6b6b]">
                                Auto
                              </span>
                            )}
                          </div>
                          {at ? (
                            <time className="text-[11px] tabular-nums text-[#6b6b6b]">
                              {formatDateTime(at)}
                            </time>
                          ) : (
                            <div className="text-[11px] text-[#b0b0b0]">Pending</div>
                          )}
                        </div>
                        {canClick && (
                          <Button
                            size="sm"
                            onClick={() => markOpsMilestone(mou.id, step.mark!)}
                          >
                            Mark done
                          </Button>
                        )}
                        {done && !step.auto && (
                          <Badge tone="success">Done</Badge>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {!canMark && (
                <p className="mt-2 text-xs text-[#6b6b6b]">
                  Only Operations can mark these steps. Progress is visible on the B2B consultant journey.
                </p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default function ApprovedTrackingPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#6b6b6b]">Loading…</div>}>
      <ApprovedTrackingInner />
    </Suspense>
  );
}
