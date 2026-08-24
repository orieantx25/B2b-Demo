"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import {
  Badge,
  Button,
  Input,
  Label,
  Modal,
  Select,
  SourceTag,
  StatusTone,
  Textarea,
} from "@/components/ui";
import { ConsultantJourney, MouLifecycle } from "@/components/journey";
import { MouRequestForm } from "@/components/mou-request-form";
import { CardxUpload } from "@/components/cardx-upload";
import { MeetingPhotoChip } from "@/components/geotag-photo";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import type { DocType } from "@/types";
import { MoreHorizontal } from "lucide-react";

const TAB_KEYS = [
  { value: "overview", label: "Overview" },
  { value: "journey", label: "Journey" },
  { value: "meetings", label: "Meetings" },
  { value: "mou", label: "MOU / WO" },
  { value: "utms", label: "UTMs" },
  { value: "coupons", label: "Coupons" },
  { value: "performance", label: "Performance" },
  { value: "documents", label: "Documents" },
  { value: "ownership", label: "Ownership History" },
] as const;

export default function Consultant360() {
  const { id } = useParams<{ id: string }>();
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const meetings = useAppStore((s) => s.meetings);
  const mous = useAppStore((s) => s.mous);
  const utms = useAppStore((s) => s.utms);
  const coupons = useAppStore((s) => s.coupons);
  const documents = useAppStore((s) => s.documents);
  const ownership = useAppStore((s) => s.ownership);
  const leads = useAppStore((s) => s.leads);
  const testTakers = useAppStore((s) => s.testTakers);
  const admissions = useAppStore((s) => s.admissions);
  const persona = useAppStore((s) => s.persona);
  const activities = useAppStore((s) => s.activities);

  const requestMou = useAppStore((s) => s.requestMou);
  const requestUtm = useAppStore((s) => s.requestUtm);
  const createChildUtm = useAppStore((s) => s.createChildUtm);
  const createCoupon = useAppStore((s) => s.createCoupon);
  const transferOwnership = useAppStore((s) => s.transferOwnership);
  const simulateFirstLead = useAppStore((s) => s.simulateFirstLead);
  const uploadDocument = useAppStore((s) => s.uploadDocument);

  const c = consultants.find((x) => x.id === id);
  const [tab, setTab] = useState<string>("overview");
  const [mouOpen, setMouOpen] = useState(false);
  const [mouStep, setMouStep] = useState<"ask" | "form">("ask");
  const [meetingId, setMeetingId] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [reason, setReason] = useState("SPOC change");
  const [comments, setComments] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [cardxOpen, setCardxOpen] = useState(false);

  const cMeetings = useMemo(() => meetings.filter((m) => m.consultantId === id), [meetings, id]);
  const cMous = useMemo(() => mous.filter((m) => m.consultantId === id), [mous, id]);
  const cUtms = useMemo(() => utms.filter((u) => u.consultantId === id), [utms, id]);
  const cCoupons = useMemo(() => coupons.filter((x) => x.consultantId === id), [coupons, id]);
  const cDocs = useMemo(() => documents.filter((d) => d.consultantId === id), [documents, id]);
  const cOwn = useMemo(() => ownership.filter((o) => o.consultantId === id), [ownership, id]);
  const owner = members.find((m) => m.id === c?.ownerId);

  if (!c) {
    return (
      <div className="p-8">
        <p>Consultant not found.</p>
        <Link href="/b2b/consultants" className="text-sm underline">
          Back
        </Link>
      </div>
    );
  }

  const completedMeetings = cMeetings.filter((m) => m.status === "Completed");
  const visitingCard = cDocs.find((d) => d.type === "Visiting Card");

  return (
    <div className="animate-in pb-16">
      <div className="sticky top-12 z-20 mb-4 flex flex-col gap-3 rounded-[14px] border border-[#e5e5e5] bg-white/95 p-4 shadow-[0_1px_2px_rgba(17,17,17,0.04)] backdrop-blur-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="section-title text-xl sm:text-2xl">{c.name}</h1>
            <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#6b6b6b] sm:text-sm">
            <span>Owner: {owner?.name}</span>
            <span>Region: {c.region}</span>
            <span className="font-mono text-[11px]">Code: {c.consultantCode}</span>
            {c.existingUtmCode && (
              <span className="font-mono text-[11px]">UTM/Counsellor: {c.existingUtmCode}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => {
              setMouOpen(true);
              setMouStep("ask");
            }}
          >
            Request MOU
          </Button>
          <Button size="sm" variant="outline" className="sm:hidden" onClick={() => setMoreOpen(true)}>
            <MoreHorizontal className="h-4 w-4" />
            More
          </Button>
          <div className="hidden flex-wrap gap-2 sm:flex">
            <Button size="sm" variant="outline" onClick={() => requestUtm(c.id)}>
              Request UTM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const code = `UGSOT${Date.now().toString().slice(-5)}`;
                setCouponCode(code);
                createCoupon(c.id, code);
              }}
            >
              Create Coupon
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCardxOpen(true)}>
              Upload card (CardX)
            </Button>
            {(persona === "admin" || persona === "operations") && (
              <Button size="sm" variant="secondary" onClick={() => setTransferOpen(true)}>
                Transfer Ownership
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={() => simulateFirstLead(c.id)}>
              Simulate first lead
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} title="Actions" side="bottom">
        <div className="space-y-1 p-1 pb-4">
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              requestUtm(c.id);
              setMoreOpen(false);
            }}
          >
            Request UTM
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              const code = `UGSOT${Date.now().toString().slice(-5)}`;
              setCouponCode(code);
              createCoupon(c.id, code);
              setMoreOpen(false);
            }}
          >
            Create Coupon
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              setMoreOpen(false);
              setCardxOpen(true);
            }}
          >
            Upload visiting card (CardX)
          </button>
          {(persona === "admin" || persona === "operations") && (
            <button
              type="button"
              className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
              onClick={() => {
                setMoreOpen(false);
                setTransferOpen(true);
              }}
            >
              Transfer Ownership
            </button>
          )}
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              simulateFirstLead(c.id);
              setMoreOpen(false);
            }}
          >
            Simulate first lead
          </button>
        </div>
      </Sheet>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {TAB_KEYS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Leads", c.leadsCount],
                  ["Test takers", c.testTakersCount],
                  ["Admissions", c.admissionsCount],
                  ["UTMs", cUtms.length],
                ].map(([l, v]) => (
                  <div key={String(l)} className="card-surface p-3">
                    <div className="text-[10px] uppercase text-[#6b6b6b]">{l}</div>
                    <div className="kpi-value text-xl text-[#111111]">{v}</div>
                  </div>
                ))}
              </div>
              <div className="card-surface p-4 text-sm">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>Org: {c.organization}</div>
                  <div>Phone: {c.phone}</div>
                  <div>Email: {c.email}</div>
                  <div>MOU: {c.mouStatus}</div>
                  <div>UTM status: {c.utmStatus}</div>
                  <div>
                    First meeting: {c.firstMeetingDate ? formatDate(c.firstMeetingDate) : "—"}
                  </div>
                  <div>First lead: {c.firstLeadDate ? formatDate(c.firstLeadDate) : "—"}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3">
                  <SourceTag>Synced from Existing Lead System</SourceTag>
                  <SourceTag>Synced from Existing Admission System</SourceTag>
                </div>
              </div>
              <div className="card-surface">
                <div className="border-b border-[#e5e5e5] px-4 py-2 text-sm font-semibold">Activity</div>
                <ul className="divide-y divide-[#e5e5e5]">
                  {activities
                    .filter((a) => a.consultantId === c.id)
                    .slice(0, 8)
                    .map((a) => (
                      <li key={a.id} className="px-4 py-2 text-sm">
                        <div className="font-medium">{a.title}</div>
                        <div className="text-xs text-[#6b6b6b]">{a.description}</div>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
            <ConsultantJourney consultant={c} />
          </div>
        </TabsContent>

        <TabsContent value="journey">
          <ConsultantJourney consultant={c} />
        </TabsContent>

        <TabsContent value="meetings">
          <div className="card-surface">
            <div className="border-b px-4 py-2 text-sm font-semibold">
              All meetings · geotag photos when captured
            </div>
            <ul className="divide-y divide-[#e5e5e5]">
              {cMeetings.map((m) => (
                <li key={m.id} className="px-4 py-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span>
                      {formatDate(m.date)} — {m.type} · {m.time}
                    </span>
                    <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                  </div>
                  <MeetingPhotoChip photoUrl={m.photoUrl} geo={m.geo} />
                </li>
              ))}
              {cMeetings.length === 0 && (
                <li className="px-4 py-6 text-sm text-[#6b6b6b]">No meetings yet</li>
              )}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="mou">
          <div className="space-y-4">
            {cMous.map((m) => (
              <div key={m.id} className="card-surface p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                  <Badge tone={m.commercialType === "Standard" ? "lime" : "warn"}>
                    {m.commercialType}
                  </Badge>
                  {m.slab && <Badge tone="lime">{m.slab} · Management Approved</Badge>}
                  {m.woNumber && <span className="font-mono text-xs">{m.woNumber}</span>}
                </div>
                <MouLifecycle status={m.status} />
                <div className="mt-3 grid gap-2 text-xs text-[#6b6b6b] sm:grid-cols-3">
                  <div>Legal: {m.legalStatus}</div>
                  <div>Finance: {m.financeStatus}</div>
                  <div>Terms: {m.paymentTerms}</div>
                </div>
                {m.reworkMessage && (
                  <div className="mt-2 border border-amber-200 bg-amber-50 p-2 text-sm text-amber-900">
                    ACTION REQUIRED: {m.reworkMessage}
                  </div>
                )}
              </div>
            ))}
            {cMous.length === 0 && (
              <p className="text-sm text-[#6b6b6b]">No MOU yet. Request after a completed meeting.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="utms">
          <div className="space-y-3">
            <p className="text-xs text-[#6b6b6b]">
              UTM may be requested before or after MOU. Source: Existing UTM System.
            </p>
            {cUtms.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between card-surface px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-mono font-medium">{u.code}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    Counsellor {u.counsellorCode} {u.parentUtmId ? "· Child UTM" : "· Parent"}
                  </div>
                  <SourceTag>{u.source}</SourceTag>
                </div>
                {!u.parentUtmId && (
                  <Button size="sm" variant="outline" onClick={() => createChildUtm(c.id, u.id)}>
                    Create child UTM
                  </Button>
                )}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="coupons">
          <div className="space-y-2">
            {cCoupons.map((cp) => {
              const creator = members.find((m) => m.id === cp.createdBy);
              return (
                <div key={cp.id} className="card-surface px-4 py-3 text-sm">
                  <div className="font-mono font-medium">{cp.code}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    Created by {creator?.name} · for {cp.createdFor} · {formatDate(cp.createdAt)}
                  </div>
                </div>
              );
            })}
            {couponCode && <p className="text-xs text-[#6b6b6b]">Last created: {couponCode}</p>}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="card-surface p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-[#6b6b6b]">Leads</div>
                <div className="text-2xl font-semibold">
                  {leads.filter((l) => l.consultantId === c.id).length}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6b6b6b]">Test takers</div>
                <div className="text-2xl font-semibold">
                  {testTakers.filter((t) => t.consultantId === c.id).length}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#6b6b6b]">Admissions</div>
                <div className="text-2xl font-semibold">
                  {admissions.filter((a) => a.consultantId === c.id).length}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="mb-3">
            <Button size="sm" variant="outline" onClick={() => setCardxOpen(true)}>
              Upload visiting card (CardX)
            </Button>
            {visitingCard && (
              <p className="mt-2 text-xs text-[#6b6b6b]">
                Visiting Card on file · {visitingCard.verification || visitingCard.status}
              </p>
            )}
          </div>
          <div className="space-y-2">
            {(
              ["Visiting Card", "PAN", "GST", "Bank Details", "Authorized Signatory"] as DocType[]
            ).map((type) => {
              const doc = cDocs.find((d) => d.type === type);
              return (
                <div
                  key={type}
                  className="flex items-center justify-between card-surface px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-medium">{type}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      {doc?.name || "Not uploaded"} · {doc?.verification || "Missing"}
                    </div>
                  </div>
                  {type === "Visiting Card" ? (
                    <Button size="sm" variant="outline" onClick={() => setCardxOpen(true)}>
                      {doc ? "Re-scan" : "CardX"}
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => uploadDocument(c.id, type)}>
                      {doc ? "Replace" : "Upload"}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ownership">
          <div className="card-surface p-4">
            <div className="space-y-0">
              {cOwn.map((o, i) => (
                <div key={o.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-3 w-3 bg-[#e31c24]" />
                    {i < cOwn.length - 1 && (
                      <div className="min-h-[28px] w-px flex-1 bg-[#e5e5e5]" />
                    )}
                  </div>
                  <div className="pb-4 text-sm">
                    <div className="font-medium">{o.ownerName}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      {formatDate(o.fromDate)}
                      {o.toDate ? ` → ${formatDate(o.toDate)}` : " → current"}
                      {o.reason ? ` · ${o.reason}` : ""}
                    </div>
                    {o.comments && <div className="text-xs text-[#6b6b6b]">{o.comments}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <CardxUpload
        open={cardxOpen}
        onClose={() => setCardxOpen(false)}
        mode="attach"
        consultantId={c.id}
        onExtracted={() => setTab("documents")}
      />

      <Modal open={mouOpen} onClose={() => setMouOpen(false)} title="Request MOU" xl>
        {mouStep === "ask" ? (
          <div>
            <p className="mb-3 text-sm">Is this consultant already in your meeting history?</p>
            <Label>Select completed meeting</Label>
            <Select value={meetingId} onChange={(e) => setMeetingId(e.target.value)}>
              <option value="">Select…</option>
              {completedMeetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {formatDate(m.date)} · {m.type} · {m.time}
                </option>
              ))}
            </Select>
            {completedMeetings.length === 0 && (
              <p className="mt-2 text-xs text-amber-700">
                Meeting details mandatory before MOU. Complete a meeting first.
              </p>
            )}
            <div className="mt-4 flex justify-end">
              <Button disabled={!meetingId} onClick={() => setMouStep("form")}>
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <MouRequestForm
            consultant={c}
            onBack={() => setMouStep("ask")}
            onSubmit={(data) => {
              requestMou({
                consultantId: c.id,
                meetingId,
                commercialType: data.commercialType,
                slab: data.commercialType === "Standard" ? data.slab : undefined,
                notes: [
                  `Entity: ${data.entityName} (${data.entityType})`,
                  `PAN: ${data.panNumber} · ${data.panName}`,
                  `Signatory: ${data.authorizedSignatory}`,
                  `GST: ${data.gstRegistration}`,
                  `Bank: ${data.accountName} · ${data.bankAccountNumber} · ${data.ifscCode}`,
                  `Terms: ${data.termPeriod} · ${data.paymentTerms}`,
                  `Incentive: ${data.testTakerIncentive}`,
                  `Payout: ${data.payoutStructure}`,
                ].join("\n"),
              });
              setMouOpen(false);
              setMouStep("ask");
              setTab("mou");
            }}
          />
        )}
      </Modal>

      <Modal open={transferOpen} onClose={() => setTransferOpen(false)} title="Transfer ownership">
        <div className="space-y-3">
          <div>
            <Label>New owner</Label>
            <Select value={newOwner} onChange={(e) => setNewOwner(e.target.value)}>
              <option value="">Select…</option>
              {members
                .filter((m) => m.role === "B2B Member" || m.role === "B2B Lead")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Reason</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label>Comments</Label>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
          <Button
            disabled={!newOwner}
            onClick={() => {
              transferOwnership(c.id, newOwner, reason, comments);
              setTransferOpen(false);
            }}
          >
            Transfer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
