"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, PageHeader, SourceTag, StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function B2BUtmPage() {
  const utms = useAppStore((s) => s.utms);
  const coupons = useAppStore((s) => s.coupons);
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="UTM & Coupons"
        subtitle="Maps identifiers from existing systems — does not recreate UTM architecture."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-surface">
          <div className="border-b border-[#e5e5e5] px-4 py-3 text-sm font-semibold">UTM mapping</div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f6f6f6] text-xs text-[#6b6b6b]">
                <tr>
                  <th className="px-3 py-2">UTM</th>
                  <th className="px-3 py-2">Consultant</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {utms.slice(0, 80).map((u) => {
                  const c = consultants.find((x) => x.id === u.consultantId);
                  return (
                    <tr key={u.id} className="border-t border-[#e5e5e5]">
                      <td className="px-3 py-2 font-mono text-xs">
                        {u.code}
                        <div className="text-[10px] text-[#6b6b6b]">{u.counsellorCode}</div>
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/consultants/${u.consultantId}`} className="hover:underline">
                          {c?.name}
                        </Link>
                        <div className="text-[10px] font-mono text-[#6b6b6b]">{c?.consultantCode}</div>
                      </td>
                      <td className="px-3 py-2">
                        <Badge tone={StatusTone(u.status)}>{u.status}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t px-4 py-2">
            <SourceTag>Synced from Existing UTM System</SourceTag>
          </div>
        </section>

        <section className="card-surface">
          <div className="border-b border-[#e5e5e5] px-4 py-3 text-sm font-semibold">Coupons — who created, for whom</div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-[#f6f6f6] text-xs text-[#6b6b6b]">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">For</th>
                  <th className="px-3 py-2">By</th>
                  <th className="px-3 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {coupons.slice(0, 60).map((cp) => (
                  <tr key={cp.id} className="border-t border-[#e5e5e5]">
                    <td className="px-3 py-2 font-mono text-xs">{cp.code}</td>
                    <td className="px-3 py-2">
                      <Link href={`/consultants/${cp.consultantId}`} className="hover:underline">
                        {cp.createdFor}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-xs">{members.find((m) => m.id === cp.createdBy)?.name}</td>
                    <td className="px-3 py-2 text-xs">{formatDate(cp.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
