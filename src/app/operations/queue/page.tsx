"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Badge, EmptyState, PageHeader, StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/utils";

function OpsQueueInner() {
  const router = useRouter();
  const search = useSearchParams();
  const statusFilter = search.get("status") || "all";
  const slaFilter = search.get("sla");
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);

  const selectFilter = (status: string) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    if (slaFilter === "over") params.set("sla", "over");
    const qs = params.toString();
    router.replace(qs ? `/operations/queue?${qs}` : "/operations/queue", { scroll: false });
  };

  const clearSla = () => {
    const params = new URLSearchParams();
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    const qs = params.toString();
    router.replace(qs ? `/operations/queue?${qs}` : "/operations/queue", { scroll: false });
  };

  const rows = useMemo(() => {
    let list = mous.filter((m) => m.status !== "Signed");
    if (slaFilter === "over") {
      list = list.filter((m) => new Date(m.slaDueAt) < new Date());
    }
    if (statusFilter === "action") {
      list = list.filter((m) => ["Requested", "Verification", "Rework"].includes(m.status));
    } else if (statusFilter && statusFilter !== "all") {
      list = list.filter((m) => m.status === statusFilter);
    }
    return list.sort((a, b) => {
      const aOver = new Date(a.slaDueAt) < new Date() ? 0 : 1;
      const bOver = new Date(b.slaDueAt) < new Date() ? 0 : 1;
      if (aOver !== bOver) return aOver - bOver;
      return new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime();
    });
  }, [mous, statusFilter, slaFilter]);

  const chips = [
    { id: "all", label: "All" },
    { id: "action", label: "Needs action" },
    { id: "Requested", label: "Requested" },
    { id: "Verification", label: "Verification" },
    { id: "Rework", label: "Rework" },
    { id: "Awaiting Signature", label: "Awaiting signature" },
  ];

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="MOU / WO Queue"
        subtitle="Click a work order to open verification. Rework resubmits return here automatically."
      />
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectFilter(c.id)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              statusFilter === c.id
                ? "border-[#e31c24] bg-[#e31c24] text-white"
                : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
            }`}
          >
            {c.label}
          </button>
        ))}
        {slaFilter === "over" && (
          <button
            type="button"
            onClick={clearSla}
            className="shrink-0 rounded-full border border-[#f5c2c4] bg-[#fdecec] px-3 py-1.5 text-xs font-semibold text-[#e31c24]"
          >
            SLA overdue ×
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Queue clear" description="No open MOU / WO items match this filter." />
      ) : (
        <>
          <div className="space-y-2 sm:hidden">
            {rows.map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              const owner = members.find((x) => x.id === c?.ownerId);
              const over = new Date(m.slaDueAt) < new Date();
              return (
                <Link
                  key={m.id}
                  href={`/operations/verification?id=${m.id}`}
                  className="block card-surface p-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c?.name}</div>
                      <div className="mt-0.5 text-xs text-[#6b6b6b]">
                        {m.commercialType}
                        {m.slab ? ` · ${m.slab}` : ""}
                        {owner ? ` · ${owner.name}` : ""}
                      </div>
                      <div className="mt-1 text-xs text-[#6b6b6b]">
                        Due {formatDate(m.slaDueAt)}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      {over && <Badge tone="danger">Over SLA</Badge>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto card-surface sm:block">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
                <tr>
                  <th className="px-3 py-2">Consultant</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Slab</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Due</th>
                  <th className="px-3 py-2">SLA</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const c = consultants.find((x) => x.id === m.consultantId);
                  const over = new Date(m.slaDueAt) < new Date();
                  return (
                    <tr key={m.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-3 py-2 font-medium">
                        <Link
                          href={`/operations/verification?id=${m.id}`}
                          className="hover:text-[#e31c24]"
                        >
                          {c?.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{m.commercialType}</td>
                      <td className="px-3 py-2 text-xs">{m.slab || "—"}</td>
                      <td className="px-3 py-2">
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      </td>
                      <td className="px-3 py-2 text-xs">{formatDate(m.slaDueAt)}</td>
                      <td className="px-3 py-2">
                        {over ? (
                          <Badge tone="danger">Over SLA</Badge>
                        ) : (
                          <Badge tone="success">On track</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export default function OpsQueue() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#6b6b6b]">Loading…</div>}>
      <OpsQueueInner />
    </Suspense>
  );
}
