"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  PageHeader,
  Select,
  StatusTone,
  Textarea,
} from "@/components/ui";
import { GeotagPhotoField, MeetingPhotoChip } from "@/components/geotag-photo";
import { formatDate } from "@/lib/utils";
import type { GeoTag } from "@/lib/geo";
import type { EventType, Meeting, MeetingType } from "@/types";
import { cn } from "@/lib/utils";

function MeetingsPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const meetings = useAppStore((s) => s.meetings);
  const events = useAppStore((s) => s.events);
  const consultants = useAppStore((s) => s.consultants);
  const scheduleMeeting = useAppStore((s) => s.scheduleMeeting);
  const completeMeeting = useAppStore((s) => s.completeMeeting);
  const attachMeetingPhoto = useAppStore((s) => s.attachMeetingPhoto);
  const linkMeetingToConsultant = useAppStore((s) => s.linkMeetingToConsultant);
  const rescheduleMeeting = useAppStore((s) => s.rescheduleMeeting);
  const createEvent = useAppStore((s) => s.createEvent);
  const uploadEventSchedule = useAppStore((s) => s.uploadEventSchedule);
  const inviteToEvent = useAppStore((s) => s.inviteToEvent);
  const uploadEventData = useAppStore((s) => s.uploadEventData);
  const findCalendarConflict = useAppStore((s) => s.findCalendarConflict);
  const createConsultant = useAppStore((s) => s.createConsultant);
  const findDuplicates = useAppStore((s) => s.findDuplicates);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const members = useAppStore((s) => s.members);
  const addToast = useAppStore((s) => s.addToast);
  const persona = useAppStore((s) => s.persona);

  const [tab, setTab] = useState<"meetings" | "events">("meetings");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [whoMode, setWhoMode] = useState<"new" | "previous">("new");
  const [consultantSearch, setConsultantSearch] = useState("");
  const [dupWarning, setDupWarning] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [eventOpen, setEventOpen] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [photoMeetingId, setPhotoMeetingId] = useState<string | null>(null);
  const [photoDraft, setPhotoDraft] = useState<{ photoUrl: string; geo: GeoTag } | null>(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [manageEventId, setManageEventId] = useState<string | null>(null);
  const [invitePick, setInvitePick] = useState<string[]>([]);

  const [form, setForm] = useState({
    consultantName: "",
    consultantId: "",
    date: new Date().toISOString().slice(0, 10),
    time: "10:00",
    type: "In Person" as MeetingType,
    phone: "",
    email: "",
    location: "",
    notes: "",
    organization: "",
  });

  const [eventForm, setEventForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "17:00",
    location: "",
    notes: "",
    type: "Career Fair" as EventType,
    inviteMemberIds: [] as string[],
    scheduleFileName: "",
  });

  const myConsultants = useMemo(() => {
    const rows =
      persona === "b2b" ? consultants.filter((c) => c.ownerId === currentUserId) : consultants;
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [consultants, persona, currentUserId]);

  const filteredConsultants = useMemo(() => {
    const q = consultantSearch.trim().toLowerCase();
    if (!q) return myConsultants.slice(0, 50);
    return myConsultants
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.consultantCode.toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [myConsultants, consultantSearch]);

  const slotConflict = useMemo(
    () => findCalendarConflict(form.date, form.time),
    [findCalendarConflict, form.date, form.time]
  );

  useEffect(() => {
    const schedule = search.get("schedule");
    const photo = search.get("photo");
    const openId = search.get("open");
    const consultantIdParam = search.get("consultantId");
    const todayParam = search.get("today");

    if (todayParam === "1") {
      setTodayOnly(true);
      setTab("meetings");
      router.replace("/b2b/meetings", { scroll: false });
    }

    if (openId) {
      setDetailId(openId);
      setTab("meetings");
      router.replace("/b2b/meetings", { scroll: false });
    }

    if (schedule === "1") {
      setScheduleOpen(true);
      setStep(1);
      if (consultantIdParam) {
        const c = consultants.find((x) => x.id === consultantIdParam);
        if (c) {
          setWhoMode("previous");
          setForm((f) => ({
            ...f,
            consultantId: c.id,
            consultantName: c.name,
            phone: c.phone,
            email: c.email,
            organization: c.organization,
          }));
          setConsultantSearch(c.name);
        }
      } else {
        setWhoMode("new");
      }
      router.replace("/b2b/meetings", { scroll: false });
    }

    if (photo && photo !== "1") {
      const target = meetings.find((m) => m.id === photo);
      if (target) {
        setDetailId(target.id);
        setPhotoMeetingId(target.id);
        setPhotoDraft(
          target.photoUrl && target.geo ? { photoUrl: target.photoUrl, geo: target.geo } : null
        );
      }
      router.replace("/b2b/meetings", { scroll: false });
    } else if (photo === "1") {
      const needing = meetings.find((m) => !m.photoUrl && m.status !== "Cancelled");
      if (needing) {
        setDetailId(needing.id);
        setPhotoMeetingId(needing.id);
      }
      router.replace("/b2b/meetings", { scroll: false });
    }
  }, [search, router, meetings, consultants]);

  const today = new Date().toISOString().slice(0, 10);
  const sorted = useMemo(() => {
    let rows = [...meetings].sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));
    if (persona === "b2b") rows = rows.filter((m) => m.ownerId === currentUserId);
    if (todayOnly) rows = rows.filter((m) => m.date === today);
    return rows.slice(0, 100);
  }, [meetings, todayOnly, today, persona, currentUserId]);

  const myEvents = useMemo(() => {
    let rows = [...events];
    if (persona === "b2b") rows = rows.filter((e) => e.ownerId === currentUserId);
    return rows.slice(0, 48);
  }, [events, persona, currentUserId]);

  const detailMeeting = detailId ? meetings.find((m) => m.id === detailId) : null;

  const checkDuplicates = () => {
    if (whoMode !== "new" || form.consultantId) {
      setDupWarning(null);
      return;
    }
    if (!form.consultantName.trim() && !form.email.trim()) {
      setDupWarning(null);
      return;
    }
    const found = findDuplicates(form.consultantName, form.phone, form.email);
    if (found.length) {
      const c = found[0]!;
      setDupWarning(`Consultant already exists: ${c.name}. Using existing record.`);
      setForm((f) => ({
        ...f,
        consultantId: c.id,
        consultantName: c.name,
        phone: c.phone,
        email: c.email,
        organization: c.organization,
      }));
      addToast({
        title: "Consultant already exists",
        description: `Linked to ${c.name}`,
        variant: "error",
      });
    } else {
      setDupWarning(null);
    }
  };

  const submitMeeting = () => {
    if (!form.consultantName.trim()) {
      addToast({ title: "Name required", variant: "error" });
      setStep(1);
      return;
    }
    if (whoMode === "new" && !form.consultantId && form.phone.trim().length < 8) {
      addToast({
        title: "Phone required",
        description: "Enter a phone for a new consultant.",
        variant: "error",
      });
      setStep(1);
      return;
    }
    if (findCalendarConflict(form.date, form.time)) {
      setStep(2);
      return;
    }

    // Final duplicate check for new
    let resolvedConsultantId = form.consultantId || undefined;
    if (whoMode === "new" && !resolvedConsultantId) {
      const found = findDuplicates(form.consultantName, form.phone, form.email);
      if (found.length) {
        const c = found[0]!;
        resolvedConsultantId = c.id;
        setForm((f) => ({
          ...f,
          consultantId: c.id,
          consultantName: c.name,
          phone: c.phone,
          email: c.email,
          organization: c.organization,
        }));
        setDupWarning(`Consultant already exists: ${c.name}. Scheduling against existing.`);
      }
    }

    const mid = scheduleMeeting({
      consultantName: form.consultantName,
      consultantId: resolvedConsultantId,
      date: form.date,
      time: form.time,
      type: form.type,
      phone: form.phone,
      email: form.email,
      location: form.location,
      notes: form.notes,
      organization: form.organization || form.consultantName,
    });
    if (!mid) {
      setStep(2);
      return;
    }

    if (whoMode === "new" && !resolvedConsultantId) {
      createConsultant({
        name: form.consultantName,
        organization: form.organization || form.consultantName,
        phone: form.phone,
        email: form.email,
        region: members.find((m) => m.id === currentUserId)?.region || "NCR",
        meetingId: mid,
      });
    } else if (resolvedConsultantId) {
      linkMeetingToConsultant(mid, resolvedConsultantId);
    }

    setScheduleOpen(false);
    setStep(1);
    setDupWarning(null);
    setForm({
      consultantName: "",
      consultantId: "",
      date: new Date().toISOString().slice(0, 10),
      time: "10:00",
      type: "In Person",
      phone: "",
      email: "",
      location: "",
      notes: "",
      organization: "",
    });
  };

  const tryComplete = (m: Meeting) => {
    if (!m.photoUrl) {
      setPhotoMeetingId(m.id);
      setPhotoDraft(null);
      return;
    }
    completeMeeting(m.id);
  };

  const canStep1 =
    whoMode === "previous"
      ? !!form.consultantId && !!form.consultantName
      : !!form.consultantName.trim() && (form.consultantId ? true : form.phone.trim().length >= 8);
  const canStep2 = !!form.date && !!form.time && !slotConflict;

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Meetings & Events"
        subtitle="Select a row for details. Schedule without evidence — add photos later."
        actions={
          <>
            <Button variant="outline" onClick={() => setEventOpen(true)}>
              Create event
            </Button>
            <Button
              onClick={() => {
                setWhoMode("new");
                setScheduleOpen(true);
                setStep(1);
              }}
            >
              Schedule meeting
            </Button>
          </>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["meetings", "events"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize",
              tab === t
                ? "border-[#e31c24] bg-[#e31c24] text-white"
                : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
            )}
          >
            {t} ({t === "meetings" ? sorted.length : myEvents.length})
          </button>
        ))}
        {tab === "meetings" && (
          <button
            type="button"
            onClick={() => setTodayOnly((v) => !v)}
            className={cn(
              "min-h-10 shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold",
              todayOnly ? "border-[#111] bg-[#111] text-white" : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
            )}
          >
            Today
          </button>
        )}
      </div>

      {tab === "meetings" ? (
        sorted.length === 0 ? (
          <EmptyState
            title="No meetings"
            description="Schedule a field meeting to get started."
            action={
              <Button
                onClick={() => {
                  setScheduleOpen(true);
                  setStep(1);
                }}
              >
                Schedule meeting
              </Button>
            }
          />
        ) : (
          <>
            <div className="space-y-2 sm:hidden">
              {sorted.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setDetailId(m.id)}
                  className="card-surface w-full p-3.5 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{m.consultantName}</div>
                      <div className="mt-0.5 text-xs text-[#6b6b6b]">
                        {formatDate(m.date)} · {m.time} · {m.type}
                      </div>
                    </div>
                    <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                  </div>
                </button>
              ))}
            </div>
            <div className="hidden overflow-x-auto card-surface sm:block">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                  <tr>
                    <th className="px-3 py-2.5">Consultant</th>
                    <th className="px-3 py-2.5">When</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m) => (
                    <tr
                      key={m.id}
                      className="cursor-pointer border-t border-[#e5e5e5] hover:bg-[#fafafa]"
                      onClick={() => setDetailId(m.id)}
                    >
                      <td className="px-3 py-2.5 font-medium">{m.consultantName}</td>
                      <td className="px-3 py-2.5 text-xs text-[#6b6b6b]">
                        {formatDate(m.date)} · {m.time}
                      </td>
                      <td className="px-3 py-2.5 text-xs">{m.type}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : myEvents.length === 0 ? (
        <EmptyState
          title="No events"
          description="Create a career fair or partner day."
          action={<Button onClick={() => setEventOpen(true)}>Create event</Button>}
        />
      ) : (
        <div className="overflow-x-auto card-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
              <tr>
                <th className="px-3 py-2.5">Event</th>
                <th className="px-3 py-2.5">When</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Type</th>
              </tr>
            </thead>
            <tbody>
              {myEvents.map((e) => (
                <tr
                  key={e.id}
                  className="cursor-pointer border-t border-[#e5e5e5] hover:bg-[#fafafa]"
                  onClick={() => setManageEventId(e.id)}
                >
                  <td className="px-3 py-2.5 font-medium">{e.name}</td>
                  <td className="px-3 py-2.5 text-xs">
                    {formatDate(e.date)} · {e.startTime}–{e.endTime}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#6b6b6b]">{e.location}</td>
                  <td className="px-3 py-2.5">
                    <Badge tone="info">{e.type}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Meeting detail PIP */}
      <Modal
        open={!!detailMeeting}
        onClose={() => {
          setDetailId(null);
          setPhotoMeetingId(null);
        }}
        title={detailMeeting?.consultantName || "Meeting"}
        wide
      >
        {detailMeeting && (
          <div className="space-y-4">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-[#6b6b6b]">When</dt>
                <dd className="font-medium">
                  {formatDate(detailMeeting.date)} · {detailMeeting.time}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6b6b6b]">Type</dt>
                <dd className="font-medium">{detailMeeting.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6b6b6b]">Status</dt>
                <dd>
                  <Badge tone={StatusTone(detailMeeting.status)}>{detailMeeting.status}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6b6b6b]">Location</dt>
                <dd className="font-medium">{detailMeeting.location || "—"}</dd>
              </div>
            </dl>
            {detailMeeting.notes && (
              <p className="text-sm text-[#6b6b6b]">{detailMeeting.notes}</p>
            )}
            <MeetingPhotoChip photoUrl={detailMeeting.photoUrl} geo={detailMeeting.geo} />
            {photoMeetingId === detailMeeting.id && (
              <GeotagPhotoField
                photoUrl={photoDraft?.photoUrl}
                geo={photoDraft?.geo}
                onChange={setPhotoDraft}
              />
            )}
            <div className="flex flex-wrap gap-2">
              {detailMeeting.status !== "Completed" && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (photoDraft && photoMeetingId === detailMeeting.id) {
                      attachMeetingPhoto(detailMeeting.id, photoDraft);
                      completeMeeting(detailMeeting.id);
                      setPhotoMeetingId(null);
                      setPhotoDraft(null);
                    } else {
                      tryComplete(detailMeeting);
                    }
                  }}
                >
                  {photoDraft && photoMeetingId === detailMeeting.id
                    ? "Save photo & complete"
                    : "Complete"}
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRescheduleId(detailMeeting.id);
                  setDetailId(null);
                }}
              >
                Reschedule
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPhotoMeetingId(detailMeeting.id);
                  setPhotoDraft(
                    detailMeeting.photoUrl && detailMeeting.geo
                      ? { photoUrl: detailMeeting.photoUrl, geo: detailMeeting.geo }
                      : null
                  );
                }}
              >
                {detailMeeting.photoUrl ? "Update photo" : "Add photo"}
              </Button>
              {detailMeeting.consultantId && (
                <Link href={`/consultants/${detailMeeting.consultantId}`}>
                  <Button size="sm" variant="ghost">
                    Open 360
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule — 2 steps, no evidence */}
      <Modal
        open={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setStep(1);
          setDupWarning(null);
        }}
        title="Schedule meeting"
        wide
      >
        <div className="mb-4 flex gap-2 text-xs font-semibold">
          {[
            { n: 1 as const, label: "Who" },
            { n: 2 as const, label: "When / Where" },
          ].map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => {
                if (s.n === 1 || (s.n === 2 && canStep1)) setStep(s.n);
              }}
              className={cn(
                "rounded-full px-3 py-1.5",
                step === s.n ? "bg-[#e31c24] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]"
              )}
            >
              {s.n}. {s.label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {(
                [
                  { id: "new" as const, label: "New meeting" },
                  { id: "previous" as const, label: "Previous consultant" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setWhoMode(opt.id);
                    setDupWarning(null);
                    if (opt.id === "new") {
                      setForm((f) => ({
                        ...f,
                        consultantId: "",
                        consultantName: "",
                        phone: "",
                        email: "",
                        organization: "",
                      }));
                      setConsultantSearch("");
                    }
                  }}
                  className={cn(
                    "min-h-11 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold",
                    whoMode === opt.id
                      ? "border-[#e31c24] bg-[#fdecec] text-[#e31c24]"
                      : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {whoMode === "previous" ? (
              <div>
                <Label htmlFor="prev-search">Search your consultants</Label>
                <Input
                  id="prev-search"
                  value={consultantSearch}
                  onChange={(e) => {
                    setConsultantSearch(e.target.value);
                    setForm((f) => ({ ...f, consultantId: "", consultantName: e.target.value }));
                  }}
                  placeholder="Name, org, code, email…"
                  autoComplete="off"
                />
                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-[#e5e5e5]">
                  {filteredConsultants.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-[#6b6b6b]">No matches</p>
                  ) : (
                    filteredConsultants.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({
                            ...f,
                            consultantId: c.id,
                            consultantName: c.name,
                            phone: c.phone,
                            email: c.email,
                            organization: c.organization,
                          }));
                          setConsultantSearch(c.name);
                          setDupWarning(null);
                        }}
                        className={cn(
                          "flex w-full flex-col border-b border-[#e5e5e5] px-3 py-2.5 text-left text-sm last:border-0 hover:bg-[#fafafa]",
                          form.consultantId === c.id && "bg-[#fdecec]"
                        )}
                      >
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-xs text-[#6b6b6b]">
                          {c.organization} · {c.consultantCode}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                {form.consultantId && (
                  <p className="mt-2 text-xs text-[#1b7a4e]">
                    Selected: <strong>{form.consultantName}</strong> (name only for this meeting)
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label htmlFor="new-name">Name *</Label>
                  <Input
                    id="new-name"
                    value={form.consultantName}
                    onChange={(e) =>
                      setForm({ ...form, consultantName: e.target.value, consultantId: "" })
                    }
                    onBlur={checkDuplicates}
                  />
                </div>
                <div>
                  <Label htmlFor="new-phone">Phone *</Label>
                  <Input
                    id="new-phone"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value, consultantId: "" })}
                    onBlur={checkDuplicates}
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value, consultantId: "" })}
                    onBlur={checkDuplicates}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="new-org">Organization</Label>
                  <Input
                    id="new-org"
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  />
                </div>
                {dupWarning && (
                  <div className="sm:col-span-2 rounded-xl border border-[#f0d2ad] bg-[#fff4e8] px-3 py-2 text-sm text-[#b45309]">
                    {dupWarning}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Meeting type *</Label>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as MeetingType })}
              >
                <option>In Person</option>
                <option>Online</option>
              </Select>
            </div>
            <div>
              <Label>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
            </div>
            {slotConflict && (
              <div className="sm:col-span-2 rounded-xl border border-[#f5c2c4] bg-[#fdecec] px-3 py-2 text-sm text-[#e31c24]">
                Overlaps event <strong>{slotConflict.name}</strong> ({slotConflict.startTime}–
                {slotConflict.endTime}). Pick another slot.
              </div>
            )}
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                setScheduleOpen(false);
              } else setStep(1);
            }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step === 1 ? (
            <Button disabled={!canStep1} onClick={() => setStep(2)}>
              Continue
            </Button>
          ) : (
            <Button disabled={!canStep2} onClick={submitMeeting}>
              Schedule
            </Button>
          )}
        </div>
      </Modal>

      <Modal open={eventOpen} onClose={() => setEventOpen(false)} title="Create event" wide>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Event name *</Label>
            <Input
              value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Type</Label>
            <Select
              value={eventForm.type}
              onChange={(e) => setEventForm({ ...eventForm, type: e.target.value as EventType })}
            >
              {(["Career Fair", "Partner Meet", "Training", "Coschedule", "Other"] as EventType[]).map(
                (t) => (
                  <option key={t}>{t}</option>
                )
              )}
            </Select>
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Date *</Label>
            <Input
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Start</Label>
              <Input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({ ...eventForm, endTime: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEventOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!eventForm.name}
            onClick={() => {
              createEvent({
                name: eventForm.name,
                date: eventForm.date,
                startTime: eventForm.startTime,
                endTime: eventForm.endTime,
                location: eventForm.location || "TBD",
                notes: eventForm.notes,
                type: eventForm.type,
                inviteMemberIds: eventForm.inviteMemberIds,
                scheduleFileName: eventForm.scheduleFileName || undefined,
              });
              setEventOpen(false);
              setTab("events");
            }}
          >
            Add to calendar
          </Button>
        </div>
      </Modal>

      <Modal open={!!manageEventId} onClose={() => setManageEventId(null)} title="Event details" wide>
        {(() => {
          const ev = events.find((x) => x.id === manageEventId);
          if (!ev) return null;
          return (
            <div className="space-y-4">
              <div>
                <div className="text-sm font-semibold">{ev.name}</div>
                <div className="text-xs text-[#6b6b6b]">
                  {formatDate(ev.date)} · {ev.startTime}–{ev.endTime} · {ev.location}
                </div>
              </div>
              <div>
                <Label>Upload schedule</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && manageEventId) uploadEventSchedule(manageEventId, f.name);
                  }}
                />
              </div>
              <div>
                <Label>Event data</Label>
                <Input
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f && manageEventId) uploadEventData(manageEventId, f.name, "attendance");
                  }}
                />
              </div>
              <div>
                <Label>Invite teammates</Label>
                <div className="mt-1 max-h-32 space-y-1 overflow-y-auto rounded-xl border border-[#e5e5e5] p-2">
                  {members
                    .filter((m) => m.role === "B2B Member" || m.role === "B2B Lead")
                    .filter((m) => !ev.invites?.some((i) => i.memberId === m.id))
                    .slice(0, 12)
                    .map((m) => {
                      const checked = invitePick.includes(m.id);
                      return (
                        <label key={m.id} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setInvitePick((prev) =>
                                checked ? prev.filter((id) => id !== m.id) : [...prev, m.id]
                              )
                            }
                          />
                          {m.name}
                        </label>
                      );
                    })}
                </div>
                <Button
                  size="sm"
                  className="mt-2"
                  disabled={invitePick.length === 0}
                  onClick={() => {
                    if (manageEventId) inviteToEvent(manageEventId, invitePick);
                    setInvitePick([]);
                  }}
                >
                  Send invites
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal open={!!rescheduleId} onClose={() => setRescheduleId(null)} title="Reschedule">
        <RescheduleForm
          onSubmit={(date, time) => {
            if (!rescheduleId) return;
            if (rescheduleMeeting(rescheduleId, date, time)) setRescheduleId(null);
          }}
        />
      </Modal>
    </div>
  );
}

function RescheduleForm({ onSubmit }: { onSubmit: (date: string, time: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("10:00");
  return (
    <div className="space-y-3">
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <Label>Time</Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <Button onClick={() => onSubmit(date, time)}>Save</Button>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-[#6b6b6b]">Loading…</div>}>
      <MeetingsPageInner />
    </Suspense>
  );
}
