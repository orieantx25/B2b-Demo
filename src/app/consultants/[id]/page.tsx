"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import {
  Badge,
  Button,
  EmptyState,
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
import { GeotagPhotoField, MeetingPhotoChip } from "@/components/geotag-photo";
import { Sheet } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDate } from "@/lib/utils";
import type { DocType } from "@/types";
import type { GeoTag } from "@/lib/geo";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { LegacyPortalModal, useLegacyPortal } from "@/components/legacy-portal-modal";
import { CreateCouponModal } from "@/components/create-coupon-modal";
import { CreateUtmModal } from "@/components/create-utm-modal";

const TAB_KEYS = [
  { value: "overview", label: "Overview" },
  { value: "journey", label: "Journey" },
  { value: "meetings", label: "Meetings" },
  { value: "mou", label: "MOU / WO" },
  { value: "growth", label: "UTMs & Coupons" },
  { value: "performance", label: "Performance" },
  { value: "documents", label: "Documents" },
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
  const transferOwnership = useAppStore((s) => s.transferOwnership);
  const legacy = useLegacyPortal();
  const sendMarketingMaterial = useAppStore((s) => s.sendMarketingMaterial);
  const simulateFirstLead = useAppStore((s) => s.simulateFirstLead);
  const uploadDocument = useAppStore((s) => s.uploadDocument);
  const submitReworkDocs = useAppStore((s) => s.submitReworkDocs);
  const completeMeeting = useAppStore((s) => s.completeMeeting);
  const attachMeetingPhoto = useAppStore((s) => s.attachMeetingPhoto);

  const c = consultants.find((x) => x.id === id);
  const [tab, setTab] = useState<string>("overview");
  const [mouOpen, setMouOpen] = useState(false);
  const [mouStep, setMouStep] = useState<"ask" | "form">("ask");
  const [meetingId, setMeetingId] = useState("");
  const [transferOpen, setTransferOpen] = useState(false);
  const [newOwner, setNewOwner] = useState("");
  const [reason, setReason] = useState("SPOC change");
  const [comments, setComments] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);
  const [cardxOpen, setCardxOpen] = useState(false);
  const [utmPipOpen, setUtmPipOpen] = useState(false);
  const [couponPipOpen, setCouponPipOpen] = useState(false);
  const [photoMeetingId, setPhotoMeetingId] = useState<string | null>(null);
  const [photoDraft, setPhotoDraft] = useState<{ photoUrl: string; geo: GeoTag } | null>(null);
  const [completePromptId, setCompletePromptId] = useState<string | null>(null);

  const cMeetings = useMemo(() => meetings.filter((m) => m.consultantId === id), [meetings, id]);
  const cMous = useMemo(() => mous.filter((m) => m.consultantId === id), [mous, id]);
  const cUtms = useMemo(() => utms.filter((u) => u.consultantId === id), [utms, id]);
  const cCoupons = useMemo(() => coupons.filter((x) => x.consultantId === id), [coupons, id]);
  const cDocs = useMemo(() => documents.filter((d) => d.consultantId === id), [documents, id]);
  const cOwn = useMemo(() => ownership.filter((o) => o.consultantId === id), [ownership, id]);
  const owner = members.find((m) => m.id === c?.ownerId);

  const reworkMou = cMous.find((m) => m.status === "Rework");
  const primaryCtaLabel = reworkMou ? "Fix rework" : "Request MOU";

  if (!c) {
    return (
      <div className="p-8">
        <p>Consultant not found.</p>
        <Link href="/b2b/consultants" className="text-sm underline">
          Back to My Consultants
        </Link>
      </div>
    );
  }

  const completedMeetings = cMeetings.filter((m) => m.status === "Completed");
  const visitingCard = cDocs.find((d) => d.type === "Visiting Card");

  const openPrimaryCta = () => {
    if (reworkMou) {
      setTab("documents");
      setMouOpen(false);
      return;
    }
    setMouOpen(true);
    setMouStep("ask");
  };

  const tryComplete = (meetingId: string) => {
    const m = meetings.find((x) => x.id === meetingId);
    if (m && !m.photoUrl) {
      setCompletePromptId(meetingId);
      setPhotoDraft(null);
      return;
    }
    completeMeeting(meetingId);
  };

  return (
    <div className="animate-in pb-16">
      <div className="sticky top-12 z-20 mb-4 flex flex-col gap-3 rounded-[14px] border border-[#e5e5e5] bg-white/95 p-4 shadow-[0_1px_2px_rgba(17,17,17,0.04)] backdrop-blur-sm">
        <Link
          href="/b2b/consultants"
          className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-[#6b6b6b] hover:text-[#e31c24]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My Consultants
        </Link>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="section-title text-xl sm:text-2xl">{c.name}</h1>
            <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
            {c.incompleteProfile && <Badge tone="warn">Incomplete profile</Badge>}
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
          <Button size="sm" className="flex-1 sm:flex-none" onClick={openPrimaryCta}>
            {primaryCtaLabel}
          </Button>
          <Button size="sm" variant="outline" className="sm:hidden" onClick={() => setMoreOpen(true)}>
            <MoreHorizontal className="h-4 w-4" />
            More
          </Button>
          <div className="hidden flex-wrap gap-2 sm:flex">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setUtmPipOpen(true)}
            >
              Create UTM
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCouponPipOpen(true)}
            >
              Create Coupon
            </Button>
            <Button size="sm" variant="outline" onClick={() => sendMarketingMaterial(c.id)}>
              Send Marketing Material
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCardxOpen(true)}>
              Scan card
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
              setUtmPipOpen(true);
              setMoreOpen(false);
            }}
          >
            Create UTM
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              setCouponPipOpen(true);
              setMoreOpen(false);
            }}
          >
            Create Coupon
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              sendMarketingMaterial(c.id);
              setMoreOpen(false);
            }}
          >
            Send Marketing Material
          </button>
          <button
            type="button"
            className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[#fafafa]"
            onClick={() => {
              setMoreOpen(false);
              setCardxOpen(true);
            }}
          >
            Scan card
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
              <div className="card-surface p-4">
                <div className="mb-3 text-sm font-semibold">Ownership history</div>
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
                      </div>
                    </div>
                  ))}
                  {cOwn.length === 0 && (
                    <p className="text-sm text-[#6b6b6b]">No ownership records</p>
                  )}
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
          {cMeetings.length === 0 ? (
            <EmptyState
              title="No meetings yet"
              description="Schedule a meeting for this consultant from Meetings."
              action={
                <Link href={`/b2b/meetings?schedule=1&consultantId=${c.id}`}>
                  <Button>Schedule meeting</Button>
                </Link>
              }
            />
          ) : (
            <div className="card-surface">
              <div className="border-b px-4 py-2 text-sm font-semibold">
                All meetings · add field photos inline
              </div>
              <ul className="divide-y divide-[#e5e5e5]">
                {cMeetings.map((m) => (
                  <li key={m.id} className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div>
                          {formatDate(m.date)} — {m.type} · {m.time}
                        </div>
                        <MeetingPhotoChip photoUrl={m.photoUrl} geo={m.geo} />
                      </div>
                      <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPhotoMeetingId(m.id);
                          setPhotoDraft(
                            m.photoUrl && m.geo ? { photoUrl: m.photoUrl, geo: m.geo } : null
                          );
                        }}
                      >
                        {m.photoUrl ? "Update field photo" : "Add field photo"}
                      </Button>
                      {m.status !== "Completed" && (
                        <Button size="sm" variant="ghost" onClick={() => tryComplete(m.id)}>
                          Complete
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mou">
          <div className="space-y-4">
            {reworkMou && (
              <div className="border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="font-semibold">Action required</div>
                <p className="mt-1">{reworkMou.reworkMessage || "Rework requested by Operations."}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setTab("documents")}>
                    Upload docs
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      submitReworkDocs(reworkMou.id);
                    }}
                  >
                    Submit rework to Ops queue
                  </Button>
                </div>
              </div>
            )}
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
                    Action required: {m.reworkMessage}
                  </div>
                )}
              </div>
            ))}
            {cMous.length === 0 && (
              <EmptyState
                title="No MOU yet"
                description="Request after a completed meeting."
                action={<Button onClick={openPrimaryCta}>Request MOU</Button>}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="growth">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">UTMs</h3>
                <Button size="sm" variant="outline" onClick={() => setUtmPipOpen(true)}>
                  Create UTM
                </Button>
              </div>
              <p className="text-xs text-[#6b6b6b]">
                Create UTM in-app; short URL and params hand off to the Admin Portal stub.
              </p>
              {cUtms.length === 0 ? (
                <EmptyState title="No UTMs yet" description="Request a UTM to map counsellor codes." />
              ) : (
                cUtms.map((u) => (
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          legacy.openLegacy({
                            action: "child_utm",
                            consultantCode: c.consultantCode,
                            consultantName: c.name,
                            counsellorCode: u.counsellorCode,
                            parentUtmCode: u.code,
                          })
                        }
                      >
                        Create child UTM
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Coupons</h3>
                <Button size="sm" variant="outline" onClick={() => setCouponPipOpen(true)}>
                  Create Coupon
                </Button>
              </div>
              {cCoupons.length === 0 ? (
                <EmptyState
                  title="No coupons yet"
                  description="Create a coupon mapped to this consultant."
                />
              ) : (
                cCoupons.map((cp) => {
                  const creator = members.find((m) => m.id === cp.createdBy);
                  return (
                    <div key={cp.id} className="card-surface px-4 py-3 text-sm">
                      <div className="font-mono font-medium">{cp.code}</div>
                      <div className="text-xs text-[#6b6b6b]">
                        Created by {creator?.name} · for {cp.createdFor} · {formatDate(cp.createdAt)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
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
          <div className="mb-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setCardxOpen(true)}>
              Scan card
            </Button>
            {reworkMou && (
              <Button size="sm" onClick={() => submitReworkDocs(reworkMou.id)}>
                Submit rework to Ops queue
              </Button>
            )}
            {visitingCard && (
              <p className="mt-2 w-full text-xs text-[#6b6b6b]">
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
                      {doc ? "Re-scan" : "Scan card"}
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
      </Tabs>

      <CardxUpload
        open={cardxOpen}
        onClose={() => setCardxOpen(false)}
        mode="attach"
        consultantId={c.id}
        onExtracted={() => setTab("documents")}
      />

      <Modal
        open={!!photoMeetingId}
        onClose={() => {
          setPhotoMeetingId(null);
          setPhotoDraft(null);
        }}
        title="Add field photo"
      >
        <GeotagPhotoField
          photoUrl={photoDraft?.photoUrl}
          geo={photoDraft?.geo}
          onChange={setPhotoDraft}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setPhotoMeetingId(null);
              setPhotoDraft(null);
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={!photoDraft || !photoMeetingId}
            onClick={() => {
              if (photoMeetingId && photoDraft) attachMeetingPhoto(photoMeetingId, photoDraft);
              setPhotoMeetingId(null);
              setPhotoDraft(null);
            }}
          >
            Save photo
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!completePromptId}
        onClose={() => {
          setCompletePromptId(null);
          setPhotoDraft(null);
        }}
        title="Complete meeting"
      >
        <p className="mb-3 text-sm text-[#6b6b6b]">
          Optional: add a field photo before marking complete.
        </p>
        <GeotagPhotoField
          photoUrl={photoDraft?.photoUrl}
          geo={photoDraft?.geo}
          onChange={setPhotoDraft}
        />
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (completePromptId) completeMeeting(completePromptId);
              setCompletePromptId(null);
              setPhotoDraft(null);
            }}
          >
            Skip & complete
          </Button>
          <Button
            onClick={() => {
              if (completePromptId) {
                if (photoDraft) attachMeetingPhoto(completePromptId, photoDraft);
                completeMeeting(completePromptId);
              }
              setCompletePromptId(null);
              setPhotoDraft(null);
            }}
          >
            {photoDraft ? "Save photo & complete" : "Complete"}
          </Button>
        </div>
      </Modal>

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

      <LegacyPortalModal
        open={legacy.open}
        onClose={legacy.closeLegacy}
        action={legacy.action}
        consultantCode={legacy.consultantCode}
        consultantName={legacy.consultantName}
        counsellorCode={legacy.counsellorCode}
        parentUtmCode={legacy.parentUtmCode}
      />
      <CreateUtmModal
        open={utmPipOpen}
        onClose={() => setUtmPipOpen(false)}
        consultantId={c.id}
      />
      <CreateCouponModal
        open={couponPipOpen}
        onClose={() => setCouponPipOpen(false)}
        consultantId={c.id}
      />
    </div>
  );
}
