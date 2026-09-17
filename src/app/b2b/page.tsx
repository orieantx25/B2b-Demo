"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, StatusTone } from "@/components/ui";
import { CardxActionTile, CardxUpload, type CardxExtract } from "@/components/cardx-upload";
import { formatDate } from "@/lib/utils";
import { Calendar, CalendarPlus, ChevronRight, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

function B2BOverviewInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { user: authUser } = useAuth();
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const mous = useAppStore((s) => s.mous);
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

  const today = new Date().toISOString().slice(0, 10);
  const upcomingCount = myMeetings.filter(
    (m) =>
      (m.status === "Scheduled" || m.status === "Rescheduled") && m.date >= today
  ).length;
  const mouNeedingAction = mous.filter(
    (m) =>
      myConsultants.some((c) => c.id === m.consultantId) &&
      ["Rework", "Requested"].includes(m.status)
  ).length;

  const needsYou = useMemo(() => {
    const items: { id: string; title: string; href: string; tone: "warn" | "info" }[] = [];
    mous
      .filter(
        (m) =>
          myConsultants.some((c) => c.id === m.consultantId) && m.status === "Rework"
      )
      .slice(0, 3)
      .forEach((m) => {
        const c = consultants.find((x) => x.id === m.consultantId);
        items.push({
          id: `rework-${m.id}`,
          title: `Rework · ${c?.name || "Consultant"}`,
          href: `/consultants/${m.consultantId}`,
          tone: "warn",
        });
      });
    myMeetings
      .filter(
        (m) =>
          !m.photoUrl &&
          (m.status === "Scheduled" || m.status === "Rescheduled" || m.status === "Completed")
      )
      .slice(0, 3)
      .forEach((m) => {
        items.push({
          id: `photo-${m.id}`,
          title: `Photo needed · ${m.consultantName}`,
          href: `/b2b/meetings?photo=${m.id}`,
          tone: "info",
        });
      });
    return items.slice(0, 5);
  }, [mous, myConsultants, consultants, myMeetings]);

  const upcoming = myMeetings
    .filter((m) => m.status === "Scheduled" || m.status === "Rescheduled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);

  const firstName = (authUser?.name || user?.name || "").split(" ")[0];

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
    <div className="animate-in mx-auto max-w-3xl pb-8 sm:pb-16">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6b6b6b]">B2B Portal</p>
        <h1 className="section-title mt-1 text-2xl text-[#111111] sm:text-3xl">
          Hi{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-[#6b6b6b]">One glance — then act.</p>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <CardxActionTile onClick={() => setCardxOpen(true)} />
        <Link
          href="/b2b/meetings?schedule=1"
          className="flex min-h-[5.5rem] flex-col items-start justify-between rounded-[16px] border border-[#e5e5e5] bg-[#111111] p-3.5 text-white transition active:scale-[0.98]"
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
          className="flex min-h-[5.5rem] flex-col items-start justify-between rounded-[16px] border border-[#e5e5e5] bg-white p-3.5 transition active:scale-[0.98]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eff6ff] text-[#1d4ed8]">
            <Calendar className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold">Today</span>
            <span className="text-[11px] text-[#6b6b6b]">Meetings</span>
          </span>
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2.5">
        <Link
          href="/b2b/meetings"
          className="rounded-[14px] border border-[#e5e5e5] bg-white px-3 py-3.5 shadow-[0_1px_2px_rgba(17,17,17,0.04)]"
        >
          <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-[#6b6b6b]">
            Meetings
          </div>
          <div className="kpi-value mt-1.5 text-2xl text-[#111111]">{upcomingCount}</div>
          <div className="mt-1 text-[11px] text-[#6b6b6b]">Upcoming</div>
        </Link>
        <Link
          href="/b2b/consultants"
          className="rounded-[14px] border border-[#e5e5e5] bg-white px-3 py-3.5 shadow-[0_1px_2px_rgba(17,17,17,0.04)]"
        >
          <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-[#6b6b6b]">
            Consultants
          </div>
          <div className="kpi-value mt-1.5 text-2xl text-[#111111]">{myConsultants.length}</div>
          <div className="mt-1 text-[11px] text-[#6b6b6b]">Mine</div>
        </Link>
        <Link
          href="/b2b/mou"
          className="rounded-[14px] border border-[#e5e5e5] bg-white px-3 py-3.5 shadow-[0_1px_2px_rgba(17,17,17,0.04)]"
        >
          <div className="text-[0.62rem] font-semibold uppercase tracking-wide text-[#6b6b6b]">
            MOU action
          </div>
          <div className="kpi-value mt-1.5 text-2xl text-[#e31c24]">{mouNeedingAction}</div>
          <div className="mt-1 text-[11px] text-[#6b6b6b]">Needs you</div>
        </Link>
      </div>

      <section className="mb-5">
        <div className="mb-2.5 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-[#e31c24]" />
          <h2 className="section-title text-[1.05rem]">Needs you</h2>
        </div>
        {needsYou.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#e5e5e5] bg-white px-4 py-6 text-center text-sm text-[#6b6b6b]">
            Nothing waiting — you&apos;re clear.
          </div>
        ) : (
          <ul className="overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white">
            {needsYou.map((item) => (
              <li key={item.id} className="border-b border-[#e5e5e5] last:border-0">
                <Link
                  href={item.href}
                  className="flex min-h-12 items-center justify-between gap-2 px-4 py-3 text-sm hover:bg-[#fafafa]"
                >
                  <span className="font-medium">{item.title}</span>
                  <Badge tone={item.tone === "warn" ? "warn" : "info"}>
                    {item.tone === "warn" ? "Rework" : "Photo"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="section-title text-[1.05rem]">Upcoming</h2>
          <Link href="/b2b/meetings" className="text-xs font-semibold text-[#e31c24]">
            All meetings
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming meetings"
            description="Schedule your next field meeting."
            action={
              <Link href="/b2b/meetings?schedule=1">
                <Button size="sm">Schedule</Button>
              </Link>
            }
          />
        ) : (
          <ul className="overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white">
            {upcoming.map((m) => (
              <li key={m.id} className="border-b border-[#e5e5e5] last:border-0">
                <Link
                  href={`/b2b/meetings?open=${m.id}`}
                  className="flex min-h-12 items-center justify-between gap-3 px-4 py-3 hover:bg-[#fafafa]"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{m.consultantName}</div>
                    <div className="text-xs text-[#6b6b6b]">
                      {formatDate(m.date)} · {m.time} · {m.type}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-[#6b6b6b]" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CardxUpload open={cardxOpen} onClose={() => setCardxOpen(false)} mode="create" onExtracted={onCardx} />
    </div>
  );
}

export default function B2BOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-[#6b6b6b]" aria-busy>
          Loading…
        </div>
      }
    >
      <B2BOverviewInner />
    </Suspense>
  );
}
