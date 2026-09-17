"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, EmptyState, PageHeader, StatusTone } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ExTab = "sla" | "owner" | "utm" | "docs";

export default function ExceptionsPage() {
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const utms = useAppStore((s) => s.utms);
  const documents = useAppStore((s) => s.documents);
  const [tab, setTab] = useState<ExTab>("sla");

  const ex = useMemo(() => {
    const overSla = mous
      .filter((m) => m.status !== "Signed" && new Date(m.slaDueAt) < new Date())
      .sort((a, b) => new Date(a.slaDueAt).getTime() - new Date(b.slaDueAt).getTime());
    const withoutOwner = consultants.filter((c) => !c.ownerId);
    const unmapped = utms.filter((u) => !u.consultantId);
    const missingDocs = documents.filter(
      (d) => d.status === "Missing" || d.verification === "Missing"
    );
    return { overSla, withoutOwner, unmapped, missingDocs };
  }, [mous, consultants, utms, documents]);

  const tabs: { id: ExTab; label: string; count: number; tone: string }[] = [
    { id: "sla", label: "MOU over SLA", count: ex.overSla.length, tone: "text-[#e31c24]" },
    { id: "owner", label: "No owner", count: ex.withoutOwner.length, tone: "text-[#b45309]" },
    { id: "utm", label: "Unmapped UTM", count: ex.unmapped.length, tone: "text-[#6b6b6b]" },
    { id: "docs", label: "Missing docs", count: ex.missingDocs.length, tone: "text-[#b45309]" },
  ];

  const total = tabs.reduce((n, t) => n + t.count, 0);

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Exceptions"
        subtitle={
          total === 0
            ? "All clear — no open exceptions."
            : `${total} items need attention across SLA, ownership, UTM, and documents.`
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "card-surface min-h-[84px] p-3.5 text-left transition",
              tab === t.id ? "border-[#e31c24] ring-1 ring-[#e31c24]/30" : "hover:border-[#ccc]"
            )}
          >
            <div className={cn("text-2xl font-semibold tabular-nums", t.tone)}>{t.count}</div>
            <div className="mt-1 text-xs font-semibold text-[#111]">{t.label}</div>
          </button>
        ))}
      </div>

      {total === 0 ? (
        <EmptyState title="No exceptions" description="Ops queue is healthy." />
      ) : (
        <section className="card-surface">
          <div className="border-b border-[#e5e5e5] px-4 py-3 text-sm font-semibold">
            {tabs.find((t) => t.id === tab)?.label}
          </div>

          {tab === "sla" &&
            (ex.overSla.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[#6b6b6b]">No SLA breaches</p>
            ) : (
              <ul className="divide-y divide-[#e5e5e5]">
                {ex.overSla.slice(0, 40).map((m) => {
                  const c = consultants.find((x) => x.id === m.consultantId);
                  const href = ["Requested", "Verification", "Rework"].includes(m.status)
                    ? `/operations/verification?id=${m.id}`
                    : `/operations/signed?id=${m.id}`;
                  return (
                    <li key={m.id}>
                      <Link
                        href={href}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa]"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{c?.name}</div>
                          <div className="text-xs text-[#e31c24]">Due {formatDate(m.slaDueAt)}</div>
                        </div>
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}

          {tab === "owner" &&
            (ex.withoutOwner.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[#6b6b6b]">All consultants have owners</p>
            ) : (
              <ul className="divide-y divide-[#e5e5e5]">
                {ex.withoutOwner.slice(0, 40).map((c) => (
                  <li key={c.id}>
                    <Link
                      href="/operations/ownership"
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa]"
                    >
                      <div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className="text-xs text-[#6b6b6b]">{c.consultantCode}</div>
                      </div>
                      <span className="text-xs font-semibold text-[#e31c24]">Assign →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "utm" &&
            (ex.unmapped.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[#6b6b6b]">No unmapped UTMs</p>
            ) : (
              <ul className="divide-y divide-[#e5e5e5]">
                {ex.unmapped.slice(0, 40).map((u) => (
                  <li key={u.id}>
                    <Link
                      href="/operations/utm"
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa]"
                    >
                      <div className="font-mono text-sm font-semibold">{u.code}</div>
                      <Badge tone="warn">Unmapped</Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}

          {tab === "docs" &&
            (ex.missingDocs.length === 0 ? (
              <p className="px-4 py-8 text-sm text-[#6b6b6b]">No missing documents</p>
            ) : (
              <ul className="divide-y divide-[#e5e5e5]">
                {ex.missingDocs.slice(0, 40).map((d) => {
                  const c = consultants.find((x) => x.id === d.consultantId);
                  return (
                    <li key={d.id}>
                      <Link
                        href={c ? `/consultants/${c.id}` : "/operations/queue?status=action"}
                        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa]"
                      >
                        <div>
                          <div className="text-sm font-semibold">{c?.name || "Unknown"}</div>
                          <div className="text-xs text-[#6b6b6b]">{d.type}</div>
                        </div>
                        <Badge tone="danger">Missing</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
        </section>
      )}
    </div>
  );
}
