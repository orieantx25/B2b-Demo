"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, Input, Label, PageHeader, StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function OpsUtmPage() {
  const utms = useAppStore((s) => s.utms);
  const coupons = useAppStore((s) => s.coupons);
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const [tab, setTab] = useState<"utm" | "coupon">("utm");
  const [q, setQ] = useState("");

  const filteredUtms = useMemo(() => {
    const s = q.trim().toLowerCase();
    return utms
      .filter((u) => {
        if (!s) return true;
        const c = consultants.find((x) => x.id === u.consultantId);
        return (
          u.code.toLowerCase().includes(s) ||
          (u.counsellorCode || "").toLowerCase().includes(s) ||
          (c?.name || "").toLowerCase().includes(s) ||
          (c?.consultantCode || "").toLowerCase().includes(s)
        );
      })
      .slice(0, 80);
  }, [utms, consultants, q]);

  const filteredCoupons = useMemo(() => {
    const s = q.trim().toLowerCase();
    return coupons
      .filter((cp) => {
        if (!s) return true;
        const c = consultants.find((x) => x.id === cp.consultantId);
        return (
          cp.code.toLowerCase().includes(s) ||
          cp.createdFor.toLowerCase().includes(s) ||
          (c?.name || "").toLowerCase().includes(s)
        );
      })
      .slice(0, 80);
  }, [coupons, consultants, q]);

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="UTM & Coupons"
        subtitle="Mapped identifiers synced from existing systems. Create from B2B."
        actions={
          <Link href="/b2b/utm">
            <Button size="sm">Create in B2B</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex gap-2">
          {(
            [
              { id: "utm" as const, label: `UTM (${utms.length})` },
              { id: "coupon" as const, label: `Coupons (${coupons.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`min-h-10 rounded-full border px-3.5 text-xs font-semibold ${
                tab === t.id
                  ? "border-[#e31c24] bg-[#e31c24] text-white"
                  : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="min-w-[200px] flex-1">
          <Label htmlFor="ops-utm-q">Search</Label>
          <Input
            id="ops-utm-q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Code, consultant, counsellor…"
          />
        </div>
      </div>

      {tab === "utm" ? (
        filteredUtms.length === 0 ? (
          <EmptyState title="No UTMs" description="Create from B2B or a consultant 360." />
        ) : (
          <div className="overflow-x-auto card-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                <tr>
                  <th className="px-3 py-2.5">UTM code</th>
                  <th className="px-3 py-2.5">Counsellor</th>
                  <th className="px-3 py-2.5">Consultant</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredUtms.map((u) => {
                  const c = consultants.find((x) => x.id === u.consultantId);
                  return (
                    <tr key={u.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-3 py-2.5 font-mono text-xs font-semibold">{u.code}</td>
                      <td className="px-3 py-2.5 font-mono text-xs text-[#6b6b6b]">
                        {u.counsellorCode || "—"}
                      </td>
                      <td className="px-3 py-2.5">
                        {c ? (
                          <Link href={`/consultants/${c.id}`} className="font-medium hover:text-[#e31c24]">
                            {c.name}
                            <span className="ml-1 text-xs text-[#6b6b6b]">{c.consultantCode}</span>
                          </Link>
                        ) : (
                          <Badge tone="warn">Unmapped</Badge>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={StatusTone(u.status)}>{u.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#6b6b6b]">{formatDate(u.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      ) : filteredCoupons.length === 0 ? (
        <EmptyState title="No coupons" description="Create from B2B or a consultant 360." />
      ) : (
        <div className="overflow-x-auto card-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
              <tr>
                <th className="px-3 py-2.5">Code</th>
                <th className="px-3 py-2.5">For consultant</th>
                <th className="px-3 py-2.5">Created by</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((cp) => {
                const c = consultants.find((x) => x.id === cp.consultantId);
                const by = members.find((m) => m.id === cp.createdBy);
                return (
                  <tr key={cp.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                    <td className="px-3 py-2.5 font-mono text-xs font-semibold">{cp.code}</td>
                    <td className="px-3 py-2.5">
                      {c ? (
                        <Link href={`/consultants/${c.id}`} className="hover:text-[#e31c24]">
                          {cp.createdFor || c.name}
                        </Link>
                      ) : (
                        cp.createdFor
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs">{by?.name || "—"}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={StatusTone(cp.status)}>{cp.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-[#6b6b6b]">{formatDate(cp.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
