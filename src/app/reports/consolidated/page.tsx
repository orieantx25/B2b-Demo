"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Button, Input, Label, PageHeader } from "@/components/ui";
import { ReportNav } from "@/components/report-nav";
import {
  downloadConsolidatedCsv,
  downloadConsolidatedXlsx,
} from "@/lib/consolidated-report";
import { Download, Mail, Trash2 } from "lucide-react";

export default function ConsolidatedReportPage() {
  const members = useAppStore((s) => s.members);
  const consultants = useAppStore((s) => s.consultants);
  const meetings = useAppStore((s) => s.meetings);
  const mous = useAppStore((s) => s.mous);
  const utms = useAppStore((s) => s.utms);
  const coupons = useAppStore((s) => s.coupons);
  const leads = useAppStore((s) => s.leads);
  const testTakers = useAppStore((s) => s.testTakers);
  const admissions = useAppStore((s) => s.admissions);
  const weeklyReports = useAppStore((s) => s.weeklyReports);
  const userTargets = useAppStore((s) => s.userTargets);
  const reportDigestEmails = useAppStore((s) => s.reportDigestEmails);
  const addReportDigestEmail = useAppStore((s) => s.addReportDigestEmail);
  const removeReportDigestEmail = useAppStore((s) => s.removeReportDigestEmail);
  const sendWeeklyConsolidatedReport = useAppStore((s) => s.sendWeeklyConsolidatedReport);
  const [emailDraft, setEmailDraft] = useState("");

  const source = useMemo(
    () => ({
      members,
      consultants,
      meetings,
      mous,
      utms,
      coupons,
      leads,
      testTakers,
      admissions,
      weeklyReports,
      userTargets,
    }),
    [
      members,
      consultants,
      meetings,
      mous,
      utms,
      coupons,
      leads,
      testTakers,
      admissions,
      weeklyReports,
      userTargets,
    ]
  );

  const snapshot = useMemo(
    () => [
      { label: "Meetings", value: meetings.length },
      { label: "Consultants", value: consultants.length },
      { label: "MOUs", value: mous.length },
      { label: "Weekly packs", value: weeklyReports.length },
      { label: "Leads", value: leads.length },
      { label: "Admissions", value: admissions.length },
    ],
    [meetings, consultants, mous, weeklyReports, leads, admissions]
  );

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Consolidated report"
        subtitle="Download the full portfolio as one CSV or XLSX pack, and schedule a weekly email digest."
      />
      <ReportNav />

      <div className="mb-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {snapshot.map((s) => (
          <div key={s.label} className="card-surface p-3.5">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-[#6b6b6b]">
              {s.label}
            </div>
            <div className="mt-1 text-xl font-semibold tabular-nums text-[#111]">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card-surface p-5">
          <h2 className="text-sm font-semibold text-[#111]">Download consolidated pack</h2>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            Includes Summary, Consultants, Meetings, MOU, Targets, Weekly, UTM, and Coupons sheets.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => downloadConsolidatedCsv(source)}
              className="min-h-11"
            >
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadConsolidatedXlsx(source)}
              className="min-h-11"
            >
              <Download className="h-4 w-4" />
              Download XLSX
            </Button>
          </div>
        </section>

        <section className="card-surface p-5">
          <h2 className="text-sm font-semibold text-[#111]">Weekly email digest</h2>
          <p className="mt-1 text-xs text-[#6b6b6b]">
            Add recipient emails. Send queues the consolidated report to every address (simulated).
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <div className="min-w-[200px] flex-1">
              <Label htmlFor="digest-email">Email</Label>
              <Input
                id="digest-email"
                type="email"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                placeholder="name@ugsot.edu"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addReportDigestEmail(emailDraft);
                    setEmailDraft("");
                  }
                }}
              />
            </div>
            <Button
              className="min-h-11 self-end"
              variant="outline"
              onClick={() => {
                addReportDigestEmail(emailDraft);
                setEmailDraft("");
              }}
            >
              Add email
            </Button>
          </div>

          <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto">
            {reportDigestEmails.length === 0 ? (
              <li className="text-xs text-[#6b6b6b]">No recipients yet</li>
            ) : (
              reportDigestEmails.map((email) => (
                <li
                  key={email}
                  className="flex items-center justify-between gap-2 rounded-xl border border-[#e5e5e5] px-3 py-2 text-sm"
                >
                  <span className="truncate">{email}</span>
                  <button
                    type="button"
                    className="min-h-9 min-w-9 rounded-lg text-[#6b6b6b] hover:bg-[#fafafa] hover:text-[#e31c24]"
                    aria-label={`Remove ${email}`}
                    onClick={() => removeReportDigestEmail(email)}
                  >
                    <Trash2 className="mx-auto h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>

          <Button className="mt-4 min-h-11 w-full sm:w-auto" onClick={() => sendWeeklyConsolidatedReport()}>
            <Mail className="h-4 w-4" />
            Send report on email (weekly)
          </Button>
        </section>
      </div>
    </div>
  );
}
