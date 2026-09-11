"use client";

import { PageHeader } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { formatDate } from "@/lib/utils";

export default function AdminAuditPage() {
  const activities = useAppStore((s) => s.activities);
  const members = useAppStore((s) => s.members);

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Audit" subtitle="Organization activity across consultants and MOU lifecycle." />
      <div className="card-surface">
        <ul className="divide-y divide-[#e5e5e5]">
          {activities.slice(0, 80).map((a) => {
            const actor = members.find((m) => m.id === a.actorId);
            return (
              <li key={a.id} className="px-4 py-3">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-[#6b6b6b]">{a.description}</div>
                <div className="mt-1 text-[11px] text-[#6b6b6b]">
                  {actor?.name || "System"} · {formatDate(a.createdAt)}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
