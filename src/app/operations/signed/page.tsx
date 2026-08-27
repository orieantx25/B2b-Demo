"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function SignedPage() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const documents = useAppStore((s) => s.documents);

  const signed = mous.filter((m) => m.status === "Signed");

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Signed Documents" subtitle="Signed WO copies tracked in portal." />
      {signed.length === 0 ? (
        <EmptyState title="No signed documents yet" description="Signed WOs will appear here." />
      ) : (
        <>
          <div className="space-y-2 sm:hidden">
            {signed.slice(0, 40).map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              const doc = documents.find((d) => d.mouId === m.id && d.type === "Signed WO");
              return (
                <Link
                  key={m.id}
                  href={`/consultants/${m.consultantId}`}
                  className="block card-surface p-3.5"
                >
                  <div className="text-sm font-semibold">{c?.name}</div>
                  <div className="mt-0.5 font-mono text-xs text-[#6b6b6b]">{m.woNumber}</div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-[#6b6b6b]">
                      Signed {m.signedAt ? formatDate(m.signedAt) : "—"}
                    </span>
                    <Badge tone="success">{doc?.name || "On file"}</Badge>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="hidden overflow-x-auto card-surface sm:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
                <tr>
                  <th className="px-3 py-2">WO</th>
                  <th className="px-3 py-2">Consultant</th>
                  <th className="px-3 py-2">Signed</th>
                  <th className="px-3 py-2">Doc</th>
                </tr>
              </thead>
              <tbody>
                {signed.slice(0, 40).map((m) => {
                  const c = consultants.find((x) => x.id === m.consultantId);
                  const doc = documents.find((d) => d.mouId === m.id && d.type === "Signed WO");
                  return (
                    <tr key={m.id} className="border-t border-[#e5e5e5]">
                      <td className="px-3 py-2 font-mono text-xs">{m.woNumber}</td>
                      <td className="px-3 py-2">
                        <Link href={`/consultants/${m.consultantId}`} className="hover:underline">
                          {c?.name}
                        </Link>
                      </td>
                      <td className="px-3 py-2">{m.signedAt ? formatDate(m.signedAt) : "—"}</td>
                      <td className="px-3 py-2">
                        <Badge tone="success">{doc?.name || "Signed copy on file"}</Badge>
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
