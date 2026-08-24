"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, PageHeader, StatusTone } from "@/components/ui";

export default function OpsQueue() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);

  return (
    <div className="animate-in pb-16">
      <PageHeader title="MOU / WO Queue" subtitle="Action-oriented — no hunting through every request." />
      <div className="overflow-x-auto card-surface">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
            <tr>
              <th className="px-3 py-2">Consultant</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Slab</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">SLA</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {mous
              .filter((m) => m.status !== "Signed")
              .map((m) => {
                const c = consultants.find((x) => x.id === m.consultantId);
                const over = new Date(m.slaDueAt) < new Date();
                return (
                  <tr key={m.id} className="border-t border-[#e5e5e5]">
                    <td className="px-3 py-2 font-medium">{c?.name}</td>
                    <td className="px-3 py-2">{m.commercialType}</td>
                    <td className="px-3 py-2 text-xs">{m.slab || "—"}</td>
                    <td className="px-3 py-2">
                      <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                    </td>
                    <td className="px-3 py-2">
                      {over ? <Badge tone="danger">Over SLA</Badge> : <Badge tone="success">On track</Badge>}
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/operations/verification?id=${m.id}`} className="text-xs underline">
                        Open
                      </Link>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
