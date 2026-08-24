"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Input, Label, Modal, PageHeader, Select, StatusTone, Textarea } from "@/components/ui";
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
    if (schedule === "1") {
      setOpen(true);
      router.replace("/b2b/meetings", { scroll: false });
    }
    if (photo === "1") {
      const target =
        meetings.find((m) => !m.photoUrl && m.status !== "Cancelled") || meetings[0];
      if (target) {
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
  }, [search, router, meetings]);

  const sorted = useMemo(
    () => [...meetings].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 80),
    [meetings]
  );

  const submitMeeting = () => {
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
          phone: form.phone || "9999999999",
          email:
            form.email ||
            `${form.consultantName.replace(/\s+/g, ".").toLowerCase()}@partner.edu`,
          region: members.find((m) => m.id === currentUserId)?.region || "NCR",
          meetingId: mid,
        });
      }
    }
    setOpen(false);
    setForm((f) => ({ ...f, photoUrl: undefined, geo: undefined }));
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

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Meetings & Events"
        subtitle="Portal is source of truth. Capture geotag photos in the field."
        actions={
          <>
            <Button variant="outline" onClick={() => setEventOpen(true)}>
              Create event
            </Button>
            <Button onClick={() => setOpen(true)}>Schedule meeting</Button>
          </>
        }
      />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {(["meetings", "events"] as const).map((t) => (
          <button
            key={t}
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
      </div>

      {tab === "meetings" ? (
        <>
          <div className="space-y-2 sm:hidden">
            {sorted.slice(0, 40).map((m) => (
              <div key={m.id} className="card-surface p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">
                      {m.consultantId ? (
                        <a href={`/consultants/${m.consultantId}`}>{m.consultantName}</a>
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
                    {m.photoUrl ? "Update geotag photo" : "Add geotag photo"}
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
                        <a href={`/consultants/${m.consultantId}`} className="hover:text-[#e31c24]">
                          {m.consultantName}
                        </a>
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
                          Photo
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
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

      <Modal open={open} onClose={() => setOpen(false)} title="Schedule meeting" wide>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Consultant name *</Label>
            <Input
              value={form.consultantName}
              onChange={(e) => setForm({ ...form, consultantName: e.target.value })}
              list="consultant-list"
            />
            <datalist id="consultant-list">
              {consultants.slice(0, 50).map((c) => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>
          <div>
            <Label>Link existing consultant</Label>
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
              <option value="">— New / detect —</option>
              {consultants.slice(0, 80).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
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
          <div>
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div>
            <Label>Organization</Label>
            <Input
              value={form.organization}
              onChange={(e) => setForm({ ...form, organization: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notes</Label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <GeotagPhotoField
              photoUrl={form.photoUrl}
              geo={form.geo}
              onChange={(next) => {
                if (!next) {
                  setForm({ ...form, photoUrl: undefined, geo: undefined });
                  return;
                }
                if (next.geo.label?.includes("demo")) {
                  addToast({ title: "Demo geotag applied", description: next.geo.label });
                }
                setForm({ ...form, photoUrl: next.photoUrl, geo: next.geo });
              }}
            />
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={form.createConsultant}
              onChange={(e) => setForm({ ...form, createConsultant: e.target.checked })}
            />
            Create / link consultant (duplicate detection runs)
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!form.consultantName || !form.date || !form.time} onClick={submitMeeting}>
            Schedule
          </Button>
        </div>
      </Modal>

      <Modal
        open={!!photoMeetingId}
        onClose={() => {
          setPhotoMeetingId(null);
          setPhotoDraft(null);
        }}
        title="Geotag photo"
      >
        <p className="mb-3 text-xs text-[#6b6b6b]">
          Attach a field photo with location for this meeting.
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
          Optional: add a geotag photo before marking complete.
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
                  <Button size="sm" variant="outline" onClick={() => setDupOpen(false)}>
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
