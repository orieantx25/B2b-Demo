"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Label, Modal, PageHeader, StatusTone, Textarea } from "@/components/ui";
import { MouLifecycle } from "@/components/journey";
import { cn } from "@/lib/utils";
import type { DocType } from "@/types";

function VerificationInner() {
  const search = useSearchParams();
  const focusId = search.get("id");
  const mous = useAppStore((s) => s.mous);
  const consultants = useAppStore((s) => s.consultants);
  const documents = useAppStore((s) => s.documents);
  const startVerification = useAppStore((s) => s.startVerification);
  const requestRework = useAppStore((s) => s.requestRework);
  const approveMou = useAppStore((s) => s.approveMou);
  const generateWo = useAppStore((s) => s.generateWo);
  const sendWo = useAppStore((s) => s.sendWo);
  const markSigned = useAppStore((s) => s.markSigned);

  const queue = useMemo(
    () =>
      mous.filter((m) =>
        ["Requested", "Verification", "Rework", "Approved", "WO Generated", "WO Sent", "Awaiting Signature"].includes(
          m.status
        )
      ),
    [mous]
  );
  const [selectedId, setSelectedId] = useState(focusId || queue[0]?.id || "");
  const mou = mous.find((m) => m.id === selectedId) || queue[0];
  const c = consultants.find((x) => x.id === mou?.consultantId);
  const docs = documents.filter((d) => d.consultantId === mou?.consultantId);

  const [reworkOpen, setReworkOpen] = useState(false);
  const [reworkItems, setReworkItems] = useState<DocType[]>(["GST"]);
  const [reworkMsg, setReworkMsg] = useState("Please upload the latest GST certificate.");
  const [woPreview, setWoPreview] = useState(false);

  if (!mou || !c) {
    return (
      <div className="animate-in pb-16">
        <PageHeader title="Verification" subtitle="No items in queue" />
      </div>
    );
  }

  const toggleItem = (t: DocType) => {
    setReworkItems((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader title="Verification workspace" subtitle="Split-screen verify · OCR does not approve" />
      <div className="mb-4 flex gap-2 overflow-x-auto">
        {queue.slice(0, 15).map((m) => {
          const cc = consultants.find((x) => x.id === m.consultantId);
          return (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                if (m.status === "Requested") startVerification(m.id);
              }}
              className={`shrink-0 border px-3 py-1.5 text-xs ${m.id === mou.id ? "border-[#111111] bg-[#e31c24]/30" : "border-[#e5e5e5] bg-white"}`}
            >
              {cc?.name?.slice(0, 18)}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-surface p-4 min-h-[420px]">
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

        <div className="card-surface p-4">
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
                <dd className="font-medium text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-wide text-[#6b6b6b]">
              <span className="font-semibold">Doc status</span>
              <Badge tone="success">Match</Badge>
              <Badge tone="danger">Missing</Badge>
              <Badge tone="warn">Needs Review</Badge>
            </div>
            <div className="space-y-2">
              {docs.length === 0 && (
                <p className="rounded-[8px] border border-dashed border-[#e5e5e5] bg-[#fafafa] px-3 py-4 text-xs text-[#6b6b6b]">
                  No documents uploaded yet
                </p>
              )}
              {docs.map((d) => {
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
            {["Requested", "Verification", "Rework"].includes(mou.status) && (
              <>
                <Button variant="outline" onClick={() => setReworkOpen(true)}>
                  Request rework
                </Button>
                <Button
                  onClick={() => {
                    if (mou.status === "Requested") startVerification(mou.id);
                    approveMou(mou.id);
                  }}
                >
                  Approve & continue
                </Button>
              </>
            )}
            {mou.status === "Approved" && mou.commercialType === "Standard" && (
              <Button onClick={() => generateWo(mou.id)}>Generate standard WO</Button>
            )}
            {mou.status === "Approved" && mou.commercialType === "Non-Standard" && (
              <p className="text-xs text-[#6b6b6b]">Non-standard continues via Legal/Finance email chain. Portal tracks status only.</p>
            )}
            {mou.status === "WO Generated" && (
              <>
                <Button variant="outline" onClick={() => setWoPreview(true)}>
                  Preview WO
                </Button>
                <Button onClick={() => sendWo(mou.id)}>Send WO</Button>
              </>
            )}
            {(mou.status === "WO Sent" || mou.status === "Awaiting Signature") && (
              <Button onClick={() => markSigned(mou.id)}>Mark signed copy received</Button>
            )}
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

      <Modal open={woPreview} onClose={() => setWoPreview(false)} title="Work Order preview" wide>
        <div className="border border-[#e5e5e5] bg-[#f6f6f6] p-6">
          <div className="text-xs uppercase tracking-wider text-[#6b6b6b]">upGrad School of Technology</div>
          <h3 className="mt-2 text-lg font-semibold">Work Order {mou.woNumber || "(pending number)"}</h3>
          <div className="mt-4 space-y-1 text-sm">
            <div>Consultant: {c.name}</div>
            <div>Commercial slab: {mou.slab} · Management Approved</div>
            <div>Payment terms: {mou.paymentTerms}</div>
            <div>Status: {mou.status}</div>
          </div>
          <p className="mt-6 text-xs text-[#6b6b6b]">Simulated polished WO document — no real email sent.</p>
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
