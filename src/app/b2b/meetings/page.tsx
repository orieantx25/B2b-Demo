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
import type { MeetingType } from "@/types";

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
  const createConsultant = useAppStore((s) => s.createConsultant);
  const findDuplicates = useAppStore((s) => s.findDuplicates);
  const requestMerge = useAppStore((s) => s.requestMerge);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const members = useAppStore((s) => s.members);
  const addToast = useAppStore((s) => s.addToast);

  const [tab, setTab] = useState<"meetings" | "events">("meetings");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [eventOpen, setEventOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [dups, setDups] = useState<ReturnType<typeof findDuplicates>>([]);
  const [pendingCreate, setPendingCreate] = useState<{
    name: string;
    organization: string;
    phone: string;
    email: string;
    region: string;
    meetingId?: string;
  } | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [photoMeetingId, setPhotoMeetingId] = useState<string | null>(null);
  const [photoDraft, setPhotoDraft] = useState<{ photoUrl: string; geo: GeoTag } | null>(null);
  const [completePromptId, setCompletePromptId] = useState<string | null>(null);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
  const [photoEmptyOpen, setPhotoEmptyOpen] = useState(false);
  const [todayOnly, setTodayOnly] = useState(false);

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
    createConsultant: true,
    photoUrl: "" as string | undefined,
    geo: undefined as GeoTag | undefined,
  });

  const [eventForm, setEventForm] = useState({
    name: "",
    date: new Date().toISOString().slice(0, 10),
    location: "",
    notes: "",
  });

  useEffect(() => {
    const schedule = search.get("schedule");
    const photo = search.get("photo");
    const consultantIdParam = search.get("consultantId");
    const todayParam = search.get("today");

    if (todayParam === "1") {
      setTodayOnly(true);
      setTab("meetings");
      router.replace("/b2b/meetings", { scroll: false });
    }

    if (schedule === "1") {
      setOpen(true);
      setStep(1);
      if (consultantIdParam) {
        const c = consultants.find((x) => x.id === consultantIdParam);
        if (c) {
          setForm((f) => ({
            ...f,
            consultantId: c.id,
            consultantName: c.name,
            phone: c.phone,
            email: c.email,
            organization: c.organization,
            createConsultant: false,
          }));
        }
      }
      router.replace("/b2b/meetings", { scroll: false });
    }

    if (photo === "1") {
      const candidates = meetings.filter((m) => m.status !== "Cancelled");
      const needingPhoto = candidates.filter((m) => !m.photoUrl);
      if (candidates.length === 0) {
        setPhotoEmptyOpen(true);
      } else if (needingPhoto.length === 1) {
        const target = needingPhoto[0]!;
        setPhotoMeetingId(target.id);
        setPhotoDraft(null);
      } else if (needingPhoto.length > 1 || candidates.length > 1) {
        setPhotoPickerOpen(true);
      } else {
        const target = candidates[0]!;
        setPhotoMeetingId(target.id);
        setPhotoDraft(
          target.photoUrl && target.geo
            ? { photoUrl: target.photoUrl, geo: target.geo }
            : null
        );
      }
      router.replace("/b2b/meetings", { scroll: false });
    } else if (photo && photo !== "1") {
      const target = meetings.find((m) => m.id === photo);
      if (target) {
        setPhotoMeetingId(target.id);
        setPhotoDraft(
          target.photoUrl && target.geo
            ? { photoUrl: target.photoUrl, geo: target.geo }
            : null
        );
      }
      router.replace("/b2b/meetings", { scroll: false });
    }
  }, [search, router, meetings, consultants]);

  const today = new Date().toISOString().slice(0, 10);
  const sorted = useMemo(() => {
    let rows = [...meetings].sort((a, b) => b.date.localeCompare(a.date));
    if (todayOnly) rows = rows.filter((m) => m.date === today);
    return rows.slice(0, 80);
  }, [meetings, todayOnly, today]);

  const photoCandidates = useMemo(
    () =>
      meetings
        .filter((m) => m.status !== "Cancelled")
        .sort((a, b) => {
          const aNeed = a.photoUrl ? 1 : 0;
          const bNeed = b.photoUrl ? 1 : 0;
          if (aNeed !== bNeed) return aNeed - bNeed;
          return b.date.localeCompare(a.date);
        }),
    [meetings]
  );

  const resetForm = () => {
    setStep(1);
    setForm((f) => ({ ...f, photoUrl: undefined, geo: undefined }));
  };

  const submitMeeting = () => {
    if (form.createConsultant && !form.consultantId && form.phone.trim().length < 8) {
      addToast({
        title: "Phone required",
        description: "Enter a phone number to create a consultant profile.",
        variant: "error",
      });
      setStep(1);
      return;
    }
    const mid = scheduleMeeting({
      consultantName: form.consultantName,
      consultantId: form.consultantId || undefined,
      date: form.date,
      time: form.time,
      type: form.type,
      phone: form.phone,
      email: form.email,
      location: form.location,
      notes: form.notes,
      organization: form.organization || form.consultantName,
      photoUrl: form.photoUrl,
      geo: form.geo,
    });
    if (form.createConsultant && !form.consultantId) {
      const found = findDuplicates(form.consultantName, form.phone, form.email);
      if (found.length) {
        setDups(found);
        setPendingCreate({
          name: form.consultantName,
          organization: form.organization || form.consultantName,
          phone: form.phone,
          email: form.email,
          region: members.find((m) => m.id === currentUserId)?.region || "NCR",
          meetingId: mid,
        });
        setDupOpen(true);
      } else {
        createConsultant({
          name: form.consultantName,
          organization: form.organization || form.consultantName,
          phone: form.phone,
          email: form.email,
          region: members.find((m) => m.id === currentUserId)?.region || "NCR",
          meetingId: mid,
        });
      }
    }
    setOpen(false);
    resetForm();
  };

  const tryComplete = (id: string) => {
    const m = meetings.find((x) => x.id === id);
    if (m && !m.photoUrl) {
      setCompletePromptId(id);
      setPhotoDraft(null);
      return;
    }
    completeMeeting(id);
  };

  const canStep1 =
    !!form.consultantName.trim() &&
    (!form.createConsultant || !!form.consultantId || form.phone.trim().length >= 8);
  const canStep2 = !!form.date && !!form.time;

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Meetings & Events"
        subtitle="Portal is source of truth. Capture field photos in the field."
        actions={
          <>
            <Button variant="outline" onClick={() => setEventOpen(true)}>
              Create event
            </Button>
            <Button
              onClick={() => {
                setOpen(true);
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
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold capitalize transition ${
              tab === t
                ? "border-[#e31c24] bg-[#e31c24] text-white"
                : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
            }`}
          >
            {t} ({t === "meetings" ? meetings.length : events.length})
          </button>
        ))}
        {tab === "meetings" && (
          <button
            type="button"
            onClick={() => setTodayOnly((v) => !v)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              todayOnly
                ? "border-[#111111] bg-[#111111] text-white"
                : "border-[#e5e5e5] bg-white text-[#6b6b6b]"
            }`}
          >
            Today
          </button>
        )}
      </div>

      {tab === "meetings" ? (
        sorted.length === 0 ? (
          <EmptyState
            title="No meetings yet"
            description="Schedule a field meeting or scan a visiting card first."
            action={
              <Button
                onClick={() => {
                  setOpen(true);
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
              {sorted.slice(0, 40).map((m) => (
                <div key={m.id} className="card-surface p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {m.consultantId ? (
                          <Link href={`/consultants/${m.consultantId}`}>{m.consultantName}</Link>
                        ) : (
                          m.consultantName
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-[#6b6b6b]">
                        {formatDate(m.date)} · {m.time} · {m.type}
                      </div>
                    </div>
                    <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                  </div>
                  <MeetingPhotoChip photoUrl={m.photoUrl} geo={m.geo} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.status !== "Completed" && (
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => tryComplete(m.id)}>
                        Complete
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="flex-1" onClick={() => setRescheduleId(m.id)}>
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setPhotoMeetingId(m.id);
                        setPhotoDraft(
                          m.photoUrl && m.geo ? { photoUrl: m.photoUrl, geo: m.geo } : null
                        );
                      }}
                    >
                      {m.photoUrl ? "Update field photo" : "Add field photo"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="hidden overflow-x-auto card-surface sm:block">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                  <tr>
                    <th className="px-3 py-2.5">Consultant</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Time</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Photo</th>
                    <th className="px-3 py-2.5">Status</th>
                    <th className="px-3 py-2.5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((m) => (
                    <tr key={m.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-3 py-2.5 font-medium">
                        {m.consultantId ? (
                          <Link href={`/consultants/${m.consultantId}`} className="hover:text-[#e31c24]">
                            {m.consultantName}
                          </Link>
                        ) : (
                          m.consultantName
                        )}
                      </td>
                      <td className="px-3 py-2.5">{formatDate(m.date)}</td>
                      <td className="px-3 py-2.5">{m.time}</td>
                      <td className="px-3 py-2.5">{m.type}</td>
                      <td className="px-3 py-2.5">
                        {m.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={m.photoUrl}
                            alt=""
                            className="h-8 w-12 rounded object-cover border border-[#e5e5e5]"
                          />
                        ) : (
                          <span className="text-xs text-[#6b6b6b]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {m.status !== "Completed" && (
                            <Button size="sm" variant="outline" onClick={() => tryComplete(m.id)}>
                              Complete
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => setRescheduleId(m.id)}>
                            Reschedule
                          </Button>
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
                            {m.photoUrl ? "Update photo" : "Add field photo"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      ) : events.length === 0 ? (
        <EmptyState
          title="No events yet"
          description="Create an event for field campaigns or partner days."
          action={<Button onClick={() => setEventOpen(true)}>Create event</Button>}
        />
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 36).map((e) => (
            <div key={e.id} className="card-surface p-4">
              <div className="text-sm font-semibold">{e.name}</div>
              <div className="mt-1 text-xs text-[#6b6b6b]">
                {formatDate(e.date)} · {e.location}
              </div>
              {e.notes && <p className="mt-2 text-xs text-[#6b6b6b]">{e.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        title="Schedule meeting"
        wide
      >
        <div className="mb-4 flex gap-2 text-xs font-semibold">
          {[
            { n: 1 as const, label: "Who" },
            { n: 2 as const, label: "When / Where" },
            { n: 3 as const, label: "Evidence" },
          ].map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => {
                if (s.n === 1 || (s.n === 2 && canStep1) || (s.n === 3 && canStep1 && canStep2)) {
                  setStep(s.n);
                }
              }}
              className={`rounded-full px-3 py-1 ${
                step === s.n ? "bg-[#e31c24] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]"
              }`}
            >
              {s.n}. {s.label}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Consultant</Label>
              <Select
                value={form.consultantId}
                onChange={(e) => {
                  const c = consultants.find((x) => x.id === e.target.value);
                  setForm({
                    ...form,
                    consultantId: e.target.value,
                    consultantName: c?.name || form.consultantName,
                    phone: c?.phone || form.phone,
                    email: c?.email || form.email,
                    organization: c?.organization || form.organization,
                    createConsultant: !e.target.value,
                  });
                }}
              >
                <option value="">New consultant</option>
                {consultants.slice(0, 80).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            {!form.consultantId && (
              <>
                <div className="sm:col-span-2">
                  <Label>Full name *</Label>
                  <Input
                    value={form.consultantName}
                    onChange={(e) => setForm({ ...form, consultantName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Organization</Label>
                  <Input
                    value={form.organization}
                    onChange={(e) => setForm({ ...form, organization: e.target.value })}
                  />
                </div>
              </>
            )}
            {form.consultantId && (
              <div className="sm:col-span-2 text-sm text-[#6b6b6b]">
                Linked to <strong className="text-[#111111]">{form.consultantName}</strong>
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
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="mb-3 text-xs text-[#6b6b6b]">Optional — attach evidence now or later from the list.</p>
            <GeotagPhotoField
              photoUrl={form.photoUrl}
              geo={form.geo}
              onChange={(next) => {
                if (!next) {
                  setForm({ ...form, photoUrl: undefined, geo: undefined });
                  return;
                }
                setForm({ ...form, photoUrl: next.photoUrl, geo: next.geo });
              }}
            />
          </div>
        )}

        <div className="mt-4 flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (step === 1) {
                setOpen(false);
                resetForm();
              } else setStep((s) => (s - 1) as 1 | 2 | 3);
            }}
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step < 3 ? (
            <Button
              disabled={step === 1 ? !canStep1 : !canStep2}
              onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
            >
              Continue
            </Button>
          ) : (
            <Button disabled={!canStep1 || !canStep2} onClick={submitMeeting}>
              Schedule
            </Button>
          )}
        </div>
      </Modal>

      <Modal
        open={photoEmptyOpen}
        onClose={() => setPhotoEmptyOpen(false)}
        title="Add field photo"
      >
        <EmptyState
          title="No meetings yet"
          description="Schedule a meeting first, then attach a geotagged field photo."
          action={
            <Button
              onClick={() => {
                setPhotoEmptyOpen(false);
                setOpen(true);
                setStep(1);
              }}
            >
              Schedule meeting
            </Button>
          }
        />
      </Modal>

      <Modal
        open={photoPickerOpen}
        onClose={() => setPhotoPickerOpen(false)}
        title="Choose meeting"
      >
        <p className="mb-3 text-xs text-[#6b6b6b]">Select which meeting to attach a field photo to.</p>
        <ul className="max-h-72 space-y-2 overflow-y-auto">
          {photoCandidates.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-2 rounded-[12px] border border-[#e5e5e5] px-3 py-2.5 text-left hover:border-[#e31c24]/40 hover:bg-[#fafafa]"
                onClick={() => {
                  setPhotoMeetingId(m.id);
                  setPhotoDraft(
                    m.photoUrl && m.geo ? { photoUrl: m.photoUrl, geo: m.geo } : null
                  );
                  setPhotoPickerOpen(false);
                }}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.consultantName}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    {formatDate(m.date)} · {m.time} · {m.type}
                  </div>
                </div>
                <Badge tone={m.photoUrl ? "success" : "warn"}>
                  {m.photoUrl ? "Has photo" : "Needs photo"}
                </Badge>
              </button>
            </li>
          ))}
        </ul>
      </Modal>

      <Modal
        open={!!photoMeetingId}
        onClose={() => {
          setPhotoMeetingId(null);
          setPhotoDraft(null);
        }}
        title="Add field photo"
      >
        <p className="mb-3 text-xs text-[#6b6b6b]">
          Attach a geotagged field photo for this meeting.
        </p>
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
              if (photoMeetingId && photoDraft) {
                attachMeetingPhoto(photoMeetingId, photoDraft);
              }
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
        onClose={() => setCompletePromptId(null)}
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

      <Modal open={eventOpen} onClose={() => setEventOpen(false)} title="Create event">
        <div className="space-y-3">
          <div>
            <Label>Event name</Label>
            <Input
              value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
            />
          </div>
          <div>
            <Label>Date</Label>
            <Input
              type="date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
            />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea
              value={eventForm.notes}
              onChange={(e) => setEventForm({ ...eventForm, notes: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEventOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={!eventForm.name}
            onClick={() => {
              createEvent(eventForm);
              setEventOpen(false);
            }}
          >
            Create
          </Button>
        </div>
      </Modal>

      <Modal open={dupOpen} onClose={() => setDupOpen(false)} title="Possible existing consultant" wide>
        <p className="mb-3 text-sm text-[#6b6b6b]">
          Duplicate detection matched possible records. Choose an action.
        </p>
        <div className="space-y-2">
          {dups.map((d) => {
            const owner = members.find((m) => m.id === d.ownerId);
            return (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-[#e5e5e5] p-3"
              >
                <div>
                  <div className="text-sm font-semibold">{d.name}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    Owner: {owner?.name} · {d.phone} · {d.email}
                  </div>
                  <Badge tone={StatusTone(d.status)}>{d.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (pendingCreate?.meetingId) {
                        linkMeetingToConsultant(pendingCreate.meetingId, d.id);
                      }
                      setDupOpen(false);
                      setPendingCreate(null);
                    }}
                  >
                    Use Existing
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const other = dups.find((x) => x.id !== d.id) || consultants[0];
                      if (other) requestMerge(d.id, other.id, "Possible duplicate from meeting create");
                      setDupOpen(false);
                    }}
                  >
                    Request Merge
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            onClick={() => {
              if (pendingCreate) createConsultant({ ...pendingCreate, force: true });
              setDupOpen(false);
              setPendingCreate(null);
            }}
          >
            Create New
          </Button>
        </div>
      </Modal>

      <Modal open={!!rescheduleId} onClose={() => setRescheduleId(null)} title="Reschedule meeting">
        <RescheduleForm
          onSubmit={(date, time) => {
            if (rescheduleId) rescheduleMeeting(rescheduleId, date, time);
            setRescheduleId(null);
          }}
        />
      </Modal>
    </div>
  );
}

function RescheduleForm({ onSubmit }: { onSubmit: (date: string, time: string) => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("11:00");
  return (
    <div className="space-y-3">
      <div>
        <Label>New date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <Label>New time</Label>
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <Button onClick={() => onSubmit(date, time)}>Save</Button>
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#6b6b6b]">Loading…</div>}>
      <MeetingsPageInner />
    </Suspense>
  );
}
