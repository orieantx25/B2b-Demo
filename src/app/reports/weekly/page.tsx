"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Modal, PageHeader, StatusTone, Textarea } from "@/components/ui";
import { ChartCard, ChartEmpty, chartColors, chartTooltipStyle } from "@/components/report-charts";
import { ReportNav } from "@/components/report-nav";
import { formatDate } from "@/lib/utils";

export default function WeeklyReportsPage() {
  const reports = useAppStore((s) => s.weeklyReports);
  const markReportReviewed = useAppStore((s) => s.markReportReviewed);
  const updateReportNotes = useAppStore((s) => s.updateReportNotes);
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  const view = reports.find((r) => r.id === viewId);
  const edit = reports.find((r) => r.id === editId);

  const ordered = useMemo(
    () => [...reports].sort((a, b) => a.weekStart.localeCompare(b.weekStart)),
    [reports]
  );

  const trend = useMemo(
    () =>
      ordered.map((r, i) => ({
        week: `W${i + 1}`,
        label: formatDate(r.weekStart),
        meetings: r.meetings,
        leads: r.leads,
        admissions: r.admissions,
        mouSigned: r.mouSigned,
        active: r.activeConsultants,
      })),
    [ordered]
  );

  const exceptions = useMemo(
    () =>
      ordered.map((r, i) => ({
        week: `W${i + 1}`,
        sla: r.exceptions.mouOverSla,
        noOwner: r.exceptions.withoutOwner,
        unmapped: r.exceptions.unmappedUtms,
        missingDocs: r.exceptions.missingDocuments,
      })),
    [ordered]
  );

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Weekly Reports"
        subtitle="Auto-generated. Operations reviews exceptions — not manual compile."
      />
      <ReportNav />

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Weekly momentum" subtitle="Meetings, leads, and admissions over recent weeks">
          {trend.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wkLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={chartColors.red} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={chartColors.red} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartColors.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area
                    type="monotone"
                    dataKey="meetings"
                    name="Meetings"
                    stroke={chartColors.black}
                    fill={chartColors.track}
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="leads"
                    name="Leads"
                    stroke={chartColors.red}
                    fill="url(#wkLeads)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="admissions"
                    name="Admissions"
                    stroke={chartColors.amber}
                    fill="transparent"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Exception load" subtitle="Ops attention items by week">
          {exceptions.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={exceptions} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartColors.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="sla" name="Over SLA" stackId="e" fill={chartColors.red} />
                  <Bar dataKey="noOwner" name="No owner" stackId="e" fill={chartColors.amber} />
                  <Bar dataKey="unmapped" name="Unmapped UTM" stackId="e" fill={chartColors.blue} />
                  <Bar
                    dataKey="missingDocs"
                    name="Missing docs"
                    stackId="e"
                    fill={chartColors.muted}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard title="Activation & signing" subtitle="Active consultants and MOUs signed per week" className="mb-4">
        {trend.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartColors.muted }} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="active" name="Active" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                <Bar dataKey="mouSigned" name="MOU signed" fill={chartColors.black} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="space-y-3">
        {reports.map((r) => (
          <div key={r.id} className="card-surface p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-semibold">
                  Week of {formatDate(r.weekStart)} – {formatDate(r.weekEnd)}
                </div>
                <div className="mt-1 text-xs text-[#6b6b6b]">
                  Meetings {r.meetings} · New consultants {r.newConsultants} · MOU {r.mouRequests}/
                  {r.mouSigned} signed · Active {r.activeConsultants} · Leads {r.leads} · TT{" "}
                  {r.testTakers} · Adm {r.admissions}
                </div>
              </div>
              <Badge tone={StatusTone(r.status)}>{r.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-[#6b6b6b]">
              <span>Exceptions: SLA {r.exceptions.mouOverSla}</span>
              <span>No owner {r.exceptions.withoutOwner}</span>
              <span>Unmapped UTM {r.exceptions.unmappedUtms}</span>
              <span>Missing docs {r.exceptions.missingDocuments}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setViewId(r.id)}>
                View
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditId(r.id);
                  setNotes(r.notes || "");
                }}
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(r, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `weekly-report-${r.weekEnd}.json`;
                  a.click();
                }}
              >
                Download
              </Button>
              {r.status !== "Reviewed" && (
                <Button size="sm" onClick={() => markReportReviewed(r.id)}>
                  Mark reviewed
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!view} onClose={() => setViewId(null)} title="Weekly report" wide>
        {view && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ["Meetings", view.meetings],
                ["New consultants", view.newConsultants],
                ["MOU requests", view.mouRequests],
                ["MOU signed", view.mouSigned],
                ["Active", view.activeConsultants],
                ["Leads", view.leads],
                ["Test takers", view.testTakers],
                ["Admissions", view.admissions],
              ].map(([l, v]) => (
                <div key={String(l)} className="border border-[#e5e5e5] p-2">
                  <div className="text-[10px] uppercase text-[#6b6b6b]">{l}</div>
                  <div className="text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
            <div className="border border-amber-200 bg-amber-50 p-3">
              <div className="font-medium">Exceptions</div>
              <ul className="mt-1 list-disc pl-4 text-xs">
                <li>MOU over SLA: {view.exceptions.mouOverSla}</li>
                <li>Without owner: {view.exceptions.withoutOwner}</li>
                <li>Unmapped UTMs: {view.exceptions.unmappedUtms}</li>
                <li>Missing documents: {view.exceptions.missingDocuments}</li>
                <li>Other: {view.exceptions.other}</li>
              </ul>
            </div>
            {view.notes && <p className="text-xs text-[#6b6b6b]">Notes: {view.notes}</p>}
          </div>
        )}
      </Modal>

      <Modal open={!!edit} onClose={() => setEditId(null)} title="Edit report notes">
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="mt-3 flex justify-end">
          <Button
            onClick={() => {
              if (editId) updateReportNotes(editId, notes);
              setEditId(null);
            }}
          >
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
