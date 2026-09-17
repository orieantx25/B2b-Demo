"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Label, Modal, PageHeader, StatusTone, Textarea } from "@/components/ui";
import { MouLifecycle } from "@/components/journey";
import { cn } from "@/lib/utils";
import type { DocType, VerificationFlag } from "@/types";

function VerificationInner() {
  const router = useRouter();
  const search = useSearchParams();
  const focusId = search.get("id");
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const documents = useAppStore((s) => s.documents);
  const startVerification = useAppStore((s) => s.startVerification);
  const requestRework = useAppStore((s) => s.requestRework);
  const approveMou = useAppStore((s) => s.approveMou);

  const queue = useMemo(
    () =>
      mous.filter((m) => ["Requested", "Verification", "Rework"].includes(m.status)),
    [mous]
  );
  const [selectedId, setSelectedId] = useState(focusId || queue[0]?.id || "");
  const [docFilter, setDocFilter] = useState<VerificationFlag | "all">("all");

  useEffect(() => {
    if (focusId && focusId !== selectedId) {
      setSelectedId(focusId);
    }
    // Only react to URL focus changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const selectMou = (id: string) => {
    setSelectedId(id);
    router.replace(`/operations/verification?id=${id}`, { scroll: false });
  };

  const mou = mous.find((m) => m.id === selectedId) || queue[0];
  const c = consultants.find((x) => x.id === mou?.consultantId);
  const docs = documents.filter((d) => d.consultantId === mou?.consultantId);
  const filteredDocs =
    docFilter === "all"
      ? docs
      : docs.filter((d) => (d.verification || "Needs Review") === docFilter);

  const [reworkOpen, setReworkOpen] = useState(false);
  const [reworkItems, setReworkItems] = useState<DocType[]>(["GST"]);
  const [reworkMsg, setReworkMsg] = useState("Please upload the latest GST certificate.");

  if (!mou || !c) {
    return (
      <div className="animate-in pb-16">
        <PageHeader
          title="MOU / WO verification"
          subtitle="No items need verification. Open from the MOU / WO queue."
        />
        <Link href="/operations/queue" className="text-sm font-semibold text-[#e31c24]">
          ← Back to queue
        </Link>
      </div>
    );
  }

  const toggleItem = (t: DocType) => {
    setReworkItems((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="MOU / WO verification"
        subtitle="Opened from the queue. Approve auto-marks MoU sent to legal — then continue in Approved tracking."
      />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {queue.slice(0, 15).map((m) => {
          const cc = consultants.find((x) => x.id === m.consultantId);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMou(m.id)}
              className={`shrink-0 border px-3 py-1.5 text-xs ${m.id === mou.id ? "border-[#111111] bg-[#e31c24]/30" : "border-[#e5e5e5] bg-white"}`}
            >
              {cc?.name?.slice(0, 18)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="order-2 card-surface min-h-[420px] p-4 lg:order-1">
          <div className="mb-3 text-sm font-semibold">Document preview</div>
          <div className="flex h-[360px] flex-col items-center justify-center border border-dashed border-[#e5e5e5] bg-[#f6f6f6] text-center">
            <div className="text-sm font-medium">{c.name}</div>
            <div className="mt-1 text-xs text-[#6b6b6b]">Simulated document pack</div>
            <div className="mt-4 space-y-1 text-xs">
              {docs.length === 0 && <div>No documents uploaded</div>}
              {docs.slice(0, 6).map((d) => (
                <div key={d.id}>
                  {d.type}: {d.status} · {d.verification}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="order-1 card-surface p-4 lg:order-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold">Submitted information</div>
            <Badge tone={StatusTone(mou.status)}>{mou.status}</Badge>
          </div>
          <MouLifecycle status={mou.status} />
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ["Consultant", c.name],
              ["Org", c.organization],
              ["Phone", c.phone],
              ["Email", c.email],
              ["Code", c.consultantCode],
              ["Commercial", mou.commercialType],
              ["Slab", mou.slab || "—"],
              ["Legal", mou.legalStatus],
              ["Finance", mou.financeStatus],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-2 border-b border-[#e5e5e5] py-1">
                <dt className="text-[#6b6b6b]">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-[#6b6b6b]">
              <span className="font-semibold">Filter docs</span>
              {(
                [
                  ["all", "All"],
                  ["Match", "Match"],
                  ["Missing", "Missing"],
                  ["Needs Review", "Needs Review"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDocFilter(id === "all" ? "all" : id)}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-semibold normal-case",
                    docFilter === id
                      ? "border-[#111111] bg-[#111111] text-white"
                      : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {filteredDocs.length === 0 && (
                <p className="rounded-[8px] border border-dashed border-[#e5e5e5] bg-[#fafafa] px-3 py-4 text-xs text-[#6b6b6b]">
                  No documents in this filter
                </p>
              )}
              {filteredDocs.map((d) => {
                const status = d.verification || "Needs Review";
                const tone =
                  status === "Match" ? "success" : status === "Missing" ? "danger" : "warn";
                return (
                  <div
                    key={d.id}
                    className={cn(
                      "flex items-center justify-between rounded-[8px] border px-3 py-2 text-xs",
                      tone === "success" && "border-[#b7dfc9] bg-[#e8f5ef]/40",
                      tone === "danger" && "border-[#f5c2c4] bg-[#fdecec]/50",
                      tone === "warn" && "border-[#f0d2ad] bg-[#fff4e8]/50"
                    )}
                  >
                    <span className="font-medium text-[#111111]">{d.type}</span>
                    <Badge tone={tone}>{status}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {mou.status === "Requested" && (
              <Button onClick={() => startVerification(mou.id)}>Start verification</Button>
            )}
            {["Requested", "Verification", "Rework"].includes(mou.status) && (
              <>
                <Button variant="outline" onClick={() => setReworkOpen(true)}>
                  Request rework
                </Button>
                <Button
                  onClick={() => {
                    if (mou.status === "Requested") startVerification(mou.id);
                    approveMou(mou.id);
                    router.push(`/operations/signed?id=${mou.id}`);
                  }}
                >
                  Approve (auto → sent to legal)
                </Button>
              </>
            )}
            {["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed"].includes(mou.status) && (
              <Link href={`/operations/signed?id=${mou.id}`}>
                <Button>Open approved tracking</Button>
              </Link>
            )}
            <Link href="/operations/queue">
              <Button variant="ghost">Back to queue</Button>
            </Link>
            <Link href={`/consultants/${c.id}`} className="px-3 py-2 text-sm underline">
              Open 360
            </Link>
          </div>
        </div>
      </div>

      <Modal open={reworkOpen} onClose={() => setReworkOpen(false)} title="Request rework">
        <p className="mb-3 text-sm text-[#6b6b6b]">Select exactly what needs correction.</p>
        <div className="space-y-2">
          {(["GST", "PAN", "Bank Details", "Authorized Signatory"] as DocType[]).map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={reworkItems.includes(t)} onChange={() => toggleItem(t)} />
              {t}
            </label>
          ))}
        </div>
        <div className="mt-3">
          <Label>Message to B2B</Label>
          <Textarea value={reworkMsg} onChange={(e) => setReworkMsg(e.target.value)} />
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            disabled={!reworkItems.length}
            onClick={() => {
              requestRework(mou.id, reworkItems, reworkMsg);
              setReworkOpen(false);
            }}
          >
            Send rework
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading…</div>}>
      <VerificationInner />
    </Suspense>
  );
}
