"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, PageHeader, SourceTag, StatusTone } from "@/components/ui";
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
          <div className="flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3">
            <div className="text-sm font-semibold">UTM mapping</div>
            <Link href="/b2b/consultants" className="text-xs font-semibold text-[#e31c24]">
              Open consultant →
            </Link>
          </div>
          {utms.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No UTMs yet"
                description="Request a UTM from a consultant 360."
                action={
                  <Link href="/b2b/consultants">
                    <Button size="sm">My Consultants</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-2 p-3 sm:hidden">
                {utms.slice(0, 40).map((u) => {
                  const c = consultants.find((x) => x.id === u.consultantId);
                  return (
                    <Link
                      key={u.id}
                      href={`/consultants/${u.consultantId}`}
                      className="block rounded-[12px] border border-[#e5e5e5] px-3 py-2.5"
                    >
                      <div className="font-mono text-xs font-semibold">{u.code}</div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <span className="truncate text-sm">{c?.name}</span>
                        <Badge tone={StatusTone(u.status)}>{u.status}</Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
              <div className="hidden overflow-x-auto max-h-[480px] overflow-y-auto sm:block">
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
            </>
          )}
          <div className="border-t px-4 py-2">
            <SourceTag>Synced from Existing UTM System</SourceTag>
          </div>
        </section>

        <section className="card-surface">
          <div className="border-b border-[#e5e5e5] px-4 py-3 text-sm font-semibold">
            Coupons — who created, for whom
          </div>
          {coupons.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title="No coupons yet"
                description="Create a coupon from a consultant 360."
                action={
                  <Link href="/b2b/consultants">
                    <Button size="sm">My Consultants</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <>
              <div className="space-y-2 p-3 sm:hidden">
                {coupons.slice(0, 40).map((cp) => (
                  <Link
                    key={cp.id}
                    href={`/consultants/${cp.consultantId}`}
                    className="block rounded-[12px] border border-[#e5e5e5] px-3 py-2.5"
                  >
                    <div className="font-mono text-xs font-semibold">{cp.code}</div>
                    <div className="mt-1 text-sm">{cp.createdFor}</div>
                    <div className="mt-0.5 text-xs text-[#6b6b6b]">
                      {members.find((m) => m.id === cp.createdBy)?.name} · {formatDate(cp.createdAt)}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="hidden overflow-x-auto max-h-[480px] overflow-y-auto sm:block">
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
                        <td className="px-3 py-2 text-xs">
                          {members.find((m) => m.id === cp.createdBy)?.name}
                        </td>
                        <td className="px-3 py-2 text-xs">{formatDate(cp.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
