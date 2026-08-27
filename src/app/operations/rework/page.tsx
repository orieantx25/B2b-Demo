"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, EmptyState, PageHeader } from "@/components/ui";

export default function ReworkPage() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);

  const rows = mous.filter((m) => m.status === "Rework");

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title={`Rework (${rows.length})`}
        subtitle="B2B sees Action required until corrected docs return."
      />
      {rows.length === 0 ? (
        <EmptyState title="No rework items" description="Queue is clear for rework." />
      ) : (
        <div className="space-y-2">
          {rows.map((m) => {
            const c = consultants.find((x) => x.id === m.consultantId);
            return (
              <Link
                key={m.id}
                href={`/operations/verification?id=${m.id}`}
                className="block card-surface border-[#f0d2ad] bg-[#fff4e8]/60 p-3.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{c?.name}</div>
                    <div className="mt-1 text-sm text-[#111111]">{m.reworkMessage}</div>
                    <div className="mt-1 text-xs text-[#6b6b6b]">
                      Items: {(m.reworkItems || []).join(", ")}
                    </div>
                  </div>
                  <Badge tone="warn">Action required</Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
