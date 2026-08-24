"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { PageHeader } from "@/components/ui";

export default function ReworkPage() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);

  const rows = mous.filter((m) => m.status === "Rework");

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Rework" subtitle="B2B sees Action Required until corrected docs return." />
      <div className="space-y-3">
        {rows.map((m) => {
          const c = consultants.find((x) => x.id === m.consultantId);
          return (
            <div key={m.id} className="border border-amber-200 bg-amber-50 p-4">
              <div className="font-semibold">{c?.name}</div>
              <div className="mt-1 text-sm">{m.reworkMessage}</div>
              <div className="mt-1 text-xs">Items: {(m.reworkItems || []).join(", ")}</div>
              <Link href={`/operations/verification?id=${m.id}`} className="mt-2 inline-block text-xs underline">
                Open in verification
              </Link>
            </div>
          );
        })}
        {rows.length === 0 && <p className="text-sm text-[#6b6b6b]">No rework items.</p>}
      </div>
    </div>
  );
}
