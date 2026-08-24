"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Input, PageHeader, StatusTone } from "@/components/ui";

export default function OpsConsultants() {
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    if (!q) return consultants.slice(0, 100);
    const s = q.toLowerCase();
    return consultants
      .filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.consultantCode.toLowerCase().includes(s) ||
          c.phone.includes(s)
      )
      .slice(0, 100);
  }, [consultants, q]);

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Consultant Master" subtitle="Centralized permanent profiles." />
      <Input className="mb-4 max-w-md" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="overflow-x-auto card-surface">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Code</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">MOU</th>
              <th className="px-3 py-2">Leads</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-[#e5e5e5]">
                <td className="px-3 py-2">
                  <Link href={`/consultants/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{c.consultantCode}</td>
                <td className="px-3 py-2">{members.find((m) => m.id === c.ownerId)?.name}</td>
                <td className="px-3 py-2">
                  <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-3 py-2 text-xs">{c.mouStatus}</td>
                <td className="px-3 py-2">{c.leadsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
