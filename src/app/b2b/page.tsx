"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Kpi, KpiSection, PageHeader, Panel, StatusTone } from "@/components/ui";
import { CardxActionTile, CardxUpload, type CardxExtract } from "@/components/cardx-upload";
import { formatDate } from "@/lib/utils";
import { Calendar, CalendarPlus, Camera, ChevronRight, AlertCircle } from "lucide-react";

function B2BOverviewInner() {
  const router = useRouter();
  const search = useSearchParams();
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const mous = useAppStore((s) => s.mous);
  const leads = useAppStore((s) => s.leads);
  const admissions = useAppStore((s) => s.admissions);
  const activities = useAppStore((s) => s.activities);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);
  const members = useAppStore((s) => s.members);
  const createConsultant = useAppStore((s) => s.createConsultant);
  const user = members.find((m) => m.id === currentUserId);

  const [cardxOpen, setCardxOpen] = useState(false);

  useEffect(() => {
    if (search.get("cardx") === "1") {
      setCardxOpen(true);
      router.replace("/b2b", { scroll: false });
    }
  }, [search, router]);

  const mine = persona === "b2b";
  const myMeetings = useMemo(
    () => (mine ? meetings.filter((m) => m.ownerId === currentUserId) : meetings),
    [meetings, currentUserId, mine]
  );
  const myConsultants = useMemo(
    () => (mine ? consultants.filter((c) => c.ownerId === currentUserId) : consultants),
    [consultants, currentUserId, mine]
  );
  const activeCount = myConsultants.filter((c) => c.status === "Active").length;
  const myLeadCount = leads.filter((l) => myConsultants.some((c) => c.id === l.consultantId)).length;

  const today = new Date().toISOString().slice(0, 10);
  const todaysMeetings = myMeetings.filter(
    (m) => m.date === today && (m.status === "Scheduled" || m.status === "Rescheduled")
  );
  const upcoming = myMeetings
    .filter((m) => m.status === "Scheduled" || m.status === "Rescheduled")
    .slice(0, 5);
  const pendingMous = mous
    .filter(
      (m) =>
        myConsultants.some((c) => c.id === m.consultantId) && ["Rework", "Requested"].includes(m.status)
    )
    .slice(0, 5);
  const needsPhoto = myMeetings
    .filter(
      (m) =>
        !m.photoUrl &&
        (m.status === "Scheduled" || m.status === "Rescheduled" || m.status === "Completed")
    )
    .slice(0, 4);

  const onCardx = (data: CardxExtract) => {
    const { consultant, duplicates } = createConsultant({
      name: data.name,
      organization: data.organization,
      phone: data.phone,
      email: data.email,
      region: user?.region || "NCR",
    });
    if (duplicates.length) {
      router.push(`/consultants/${duplicates[0]!.id}`);
      return;
    }
    router.push(`/consultants/${consultant.id}`);
  };

  return (
    <div className="animate-in pb-8 sm:pb-16">
      {/* Mobile hub */}
      <div className="lg:hidden">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">
            B2B Portal
          </p>
          <h1 className="section-title mt-1 text-2xl text-[#111111]">
            Hi{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-[#6b6b6b]">Capture once — keep the pipeline moving.</p>
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2.5">
          <CardxActionTile onClick={() => setCardxOpen(true)} />
          <Link
            href="/b2b/meetings?schedule=1"
            className="group flex min-h-[5.5rem] flex-col items-start justify-between rounded-[16px] border border-[#e5e5e5] bg-[#111111] p-3.5 text-left text-white shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition duration-150 active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <CalendarPlus className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Schedule</span>
              <span className="text-[11px] text-white/55">Meeting</span>
            </span>
          </Link>
          <Link
            href="/b2b/meetings?today=1"
            className="group flex min-h-[5.5rem] flex-col items-start justify-between rounded-[16px] border border-[#e5e5e5] bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition duration-150 active:scale-[0.98]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
              <Calendar className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Today</span>
              <span className="text-[11px] text-[#6b6b6b]">
                {todaysMeetings.length} meeting{todaysMeetings.length === 1 ? "" : "s"}
              </span>
            </span>
          </Link>
        </div>

        <div className="mb-5 -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="w-[7.5rem] shrink-0">
            <Kpi label="Meetings" value={myMeetings.length} tone="blue" />
          </div>
          <div className="w-[7.5rem] shrink-0">
            <Kpi label="Consultants" value={myConsultants.length} tone="violet" />
          </div>
          <div className="w-[7.5rem] shrink-0">
            <Kpi label="Active" value={activeCount} tone="green" />
          </div>
          <div className="w-[7.5rem] shrink-0">
            <Kpi label="Leads" value={myLeadCount} tone="blue" />
          </div>
          <div className="w-[7.5rem] shrink-0">
            <Kpi
              label="Admissions"
              value={admissions.filter((a) => myConsultants.some((c) => c.id === a.consultantId)).length}
              tone="red"
            />
          </div>
        </div>

        <section className="mb-5">
          <div className="mb-2.5 flex items-center gap-2">
            <span className="h-4 w-[3px] rounded-full bg-[#e31c24]" />
            <h2 className="section-title text-[1rem]">Needs you</h2>
          </div>
          <div className="space-y-2">
            {pendingMous.length === 0 && needsPhoto.length === 0 && (
              <div className="rounded-[14px] border border-dashed border-[#e5e5e5] bg-white px-4 py-6 text-center text-sm text-[#6b6b6b]">
                All clear — nothing urgent
              </div>
            )}
            {pendingMous.map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              return (
                <Link
                  key={m.id}
                  href={`/consultants/${m.consultantId}`}
                  className="flex items-center gap-3 rounded-[14px] border border-[#e5e5e5] bg-white px-3.5 py-3"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-[#e31c24]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{c?.name}</div>
                    <div className="truncate text-xs text-[#6b6b6b]">{m.reworkMessage || m.status}</div>
                  </div>
                  <Badge tone={StatusTone(m.status)}>
                    {m.status === "Rework" ? "Rework" : m.status}
                  </Badge>
                </Link>
              );
            })}
            {needsPhoto.map((m) => (
              <Link
                key={m.id}
                href={`/b2b/meetings?photo=${m.id}`}
                className="flex items-center gap-3 rounded-[14px] border border-[#e5e5e5] bg-white px-3.5 py-3"
              >
                <Camera className="h-4 w-4 shrink-0 text-[#b45309]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.consultantName}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    Add field photo · {formatDate(m.date)}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[#6b6b6b]" />
              </Link>
            ))}
          </div>
        </section>

        <Panel
          title="Upcoming meetings"
          action={
            <Link href="/b2b/meetings" className="text-current opacity-70">
              <ChevronRight className="h-4 w-4" />
            </Link>
          }
        >
          <ul className="divide-y divide-[#e5e5e5]">
            {upcoming.length === 0 && (
              <li className="px-4 py-6 text-sm text-[#6b6b6b]">No upcoming meetings</li>
            )}
            {upcoming.map((m) => (
              <li key={m.id} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {m.consultantId ? (
                      <Link
                        href={`/consultants/${m.consultantId}`}
                        className="text-sm font-semibold text-[#111111] hover:text-[#e31c24]"
                      >
                        {m.consultantName}
                      </Link>
                    ) : (
                      <div className="text-sm font-semibold text-[#111111]">{m.consultantName}</div>
                    )}
                    <div className="mt-0.5 text-xs text-[#6b6b6b]">
                      {formatDate(m.date)} · {m.time} · {m.type}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!m.photoUrl && (
                      <Link
                        href={`/b2b/meetings?photo=${m.id}`}
                        className="text-xs font-semibold text-[#b45309] underline-offset-2 hover:underline"
                      >
                        Add field photo
                      </Link>
                    )}
                    <Link
                      href="/b2b/meetings"
                      className="text-xs font-semibold text-[#6b6b6b] underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent activity" className="mt-3">
          <ul className="divide-y divide-[#e5e5e5]">
            {activities.slice(0, 5).map((a) => (
              <li key={a.id} className="px-4 py-3">
                <div className="text-sm font-semibold">{a.title}</div>
                <div className="text-xs text-[#6b6b6b]">{a.description}</div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Desktop */}
      <div className="hidden lg:block">
        <PageHeader
          title="B2B Overview"
          subtitle="Your consultant pipeline — capture once, move forward."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setCardxOpen(true)}>
                Scan card
              </Button>
              <Link href="/b2b/meetings?schedule=1">
                <Button>
                  <CalendarPlus className="h-4 w-4" />
                  Schedule meeting
                </Button>
              </Link>
            </div>
          }
        />

        <KpiSection title="Pipeline snapshot">
          <Kpi label="Meetings" value={myMeetings.length} tone="blue" />
          <Kpi label="Consultants" value={myConsultants.length} tone="violet" />
          <Kpi
            label="Active"
            value={activeCount}
            tone="green"
            hint={`${myConsultants.length ? Math.round((activeCount / myConsultants.length) * 100) : 0}% of consultants`}
          />
          <Kpi
            label="MOU Requests"
            value={mous.filter((m) => myConsultants.some((c) => c.id === m.consultantId)).length}
            tone="amber"
          />
          <Kpi
            label="Leads"
            value={myLeadCount}
            tone="blue"
            hint={
              myConsultants.length
                ? `${Math.round(myLeadCount / Math.max(myConsultants.length, 1))} avg / consultant`
                : undefined
            }
          />
          <Kpi
            label="Admissions"
            value={admissions.filter((a) => myConsultants.some((c) => c.id === a.consultantId)).length}
            tone="red"
          />
        </KpiSection>

        <Panel title="Needs you" className="mt-2 mb-3">
          <ul className="divide-y divide-[#e5e5e5]">
            {pendingMous.length === 0 && needsPhoto.length === 0 && (
              <li className="px-4 py-6 text-sm text-[#6b6b6b]">All clear — nothing urgent</li>
            )}
            {pendingMous.map((m) => {
              const c = consultants.find((x) => x.id === m.consultantId);
              return (
                <li key={m.id}>
                  <Link
                    href={`/consultants/${m.consultantId}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0 text-[#e31c24]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">{c?.name}</div>
                      <div className="truncate text-xs text-[#6b6b6b]">{m.reworkMessage || m.status}</div>
                    </div>
                    <Badge tone={StatusTone(m.status)}>
                      {m.status === "Rework" ? "Rework" : m.status}
                    </Badge>
                  </Link>
                </li>
              );
            })}
            {needsPhoto.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/b2b/meetings?photo=${m.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafafa]"
                >
                  <Camera className="h-4 w-4 shrink-0 text-[#b45309]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{m.consultantName}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      Add field photo · {formatDate(m.date)}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#6b6b6b]" />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="mt-2 grid gap-3 lg:grid-cols-3">
          <Panel
            title="Upcoming meetings"
            action={
              <Link href="/b2b/meetings" className="text-current opacity-70">
                <ChevronRight className="h-4 w-4" />
              </Link>
            }
          >
            <ul className="divide-y divide-[#e5e5e5]">
              {upcoming.length === 0 && (
                <li className="px-4 py-6 text-sm text-[#6b6b6b]">No upcoming meetings</li>
              )}
              {upcoming.map((m) => (
                <li key={m.id} className="px-4 py-3 hover:bg-[#fafafa]">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      {m.consultantId ? (
                        <Link
                          href={`/consultants/${m.consultantId}`}
                          className="text-sm font-semibold text-[#111111] hover:text-[#e31c24]"
                        >
                          {m.consultantName}
                        </Link>
                      ) : (
                        <div className="text-sm font-semibold text-[#111111]">{m.consultantName}</div>
                      )}
                      <div className="mt-0.5 text-xs text-[#6b6b6b]">
                        {formatDate(m.date)} · {m.time} · {m.type}
                      </div>
                    </div>
                    {!m.photoUrl && (
                      <Link
                        href={`/b2b/meetings?photo=${m.id}`}
                        className="text-xs font-semibold text-[#b45309] underline-offset-2 hover:underline"
                      >
                        Add field photo
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Pending MOUs">
            <ul className="divide-y divide-[#e5e5e5]">
              {pendingMous.length === 0 && (
                <li className="px-4 py-6 text-sm text-[#6b6b6b]">All clear</li>
              )}
              {pendingMous.map((m) => {
                const c = consultants.find((x) => x.id === m.consultantId);
                return (
                  <li key={m.id} className="flex items-center justify-between gap-2 px-4 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c?.name}</div>
                      <div className="truncate text-xs text-[#6b6b6b]">
                        {m.reworkMessage || m.status}
                      </div>
                    </div>
                    <Badge tone={StatusTone(m.status)}>
                      {m.status === "Rework" ? "ACTION REQUIRED" : m.status}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel title="Recent activity">
            <ul className="divide-y divide-[#e5e5e5]">
              {activities.slice(0, 6).map((a) => (
                <li key={a.id} className="px-4 py-3">
                  <div className="text-sm font-semibold">{a.title}</div>
                  <div className="text-xs text-[#6b6b6b]">{a.description}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Recent MOU activity" className="mt-3 sm:mt-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left">
              <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                <tr>
                  <th className="px-4 py-2.5">Consultant</th>
                  <th className="px-4 py-2.5">Type</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Updated</th>
                </tr>
              </thead>
              <tbody>
                {mous.slice(0, 8).map((m) => {
                  const c = consultants.find((x) => x.id === m.consultantId);
                  return (
                    <tr key={m.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-4 py-2.5 font-medium">
                        <Link
                          href={`/consultants/${m.consultantId}`}
                          className="text-[#111111] hover:text-[#e31c24]"
                        >
                          {c?.name}
                        </Link>
                      </td>
                      <td className="px-4 py-2.5 text-[#6b6b6b]">{m.commercialType}</td>
                      <td className="px-4 py-2.5">
                        <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                      </td>
                      <td className="px-4 py-2.5 text-[#6b6b6b]">{formatDate(m.updatedAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <CardxUpload open={cardxOpen} onClose={() => setCardxOpen(false)} mode="create" onExtracted={onCardx} />
    </div>
  );
}

export default function B2BOverview() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-[#6b6b6b]">Loading…</div>}>
      <B2BOverviewInner />
    </Suspense>
  );
}
