"use client";

import { useMemo, useState } from "react";
import {
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
import { Badge, Input, Kpi, KpiSection, Label, PageHeader, Select } from "@/components/ui";
import { ChartCard, ChartEmpty, chartColors, chartTooltipStyle } from "@/components/report-charts";
import { ReportNav } from "@/components/report-nav";
import { computeAchieved, emptyTargets, pct, progressTone } from "@/lib/user-targets";

function ProgressCell({ achieved, target }: { achieved: number; target: number }) {
  const p = pct(achieved, target);
  const tone = progressTone(achieved, target);
  return (
    <div>
      <div className="tabular-nums text-sm font-semibold">
        {achieved}
        <span className="font-normal text-[#6b6b6b]"> / {target || "—"}</span>
      </div>
      {p !== null ? (
        <Badge tone={tone === "neutral" ? "neutral" : tone === "success" ? "success" : tone === "warn" ? "warn" : "danger"}>
          {p}%
        </Badge>
      ) : (
        <span className="text-[10px] text-[#6b6b6b]">No target</span>
      )}
    </div>
  );
}

export default function TargetsReportPage() {
  const members = useAppStore((s) => s.members);
  const consultants = useAppStore((s) => s.consultants);
  const meetings = useAppStore((s) => s.meetings);
  const userTargets = useAppStore((s) => s.userTargets);

  const [region, setRegion] = useState("All");
  const [memberId, setMemberId] = useState("All");
  const [q, setQ] = useState("");

  const b2b = useMemo(
    () => members.filter((m) => m.role === "B2B Member" || m.role === "B2B Lead"),
    [members]
  );

  const rows = useMemo(() => {
    return b2b
      .filter((m) => region === "All" || m.region === region)
      .filter((m) => memberId === "All" || m.id === memberId)
      .filter((m) => {
        const s = q.trim().toLowerCase();
        if (!s) return true;
        return m.name.toLowerCase().includes(s) || m.email.toLowerCase().includes(s);
      })
      .map((m) => {
        const target = userTargets.find((t) => t.userId === m.id) || emptyTargets(m.id);
        const achieved = computeAchieved(m.id, consultants, meetings);
        return {
          id: m.id,
          name: m.name,
          short: m.name.split(" ")[0] || m.name,
          region: m.region,
          role: m.role,
          target,
          achieved,
          schoolsPct: pct(achieved.schools, target.schools) ?? 0,
          consultantsPct: pct(achieved.consultants, target.consultants) ?? 0,
          meetingsPct: pct(achieved.meetings, target.meetings) ?? 0,
          coachingsPct: pct(achieved.coachings, target.coachings) ?? 0,
        };
      });
  }, [b2b, region, memberId, q, userTargets, consultants, meetings]);

  const regions = Array.from(new Set(members.map((m) => m.region)));

  const teamAvg = useMemo(() => {
    if (!rows.length) return { schools: 0, consultants: 0, meetings: 0, coachings: 0 };
    const avg = (key: "schoolsPct" | "consultantsPct" | "meetingsPct" | "coachingsPct") =>
      Math.round(rows.reduce((a, r) => a + r[key], 0) / rows.length);
    return {
      schools: avg("schoolsPct"),
      consultants: avg("consultantsPct"),
      meetings: avg("meetingsPct"),
      coachings: avg("coachingsPct"),
    };
  }, [rows]);

  const chartRows = rows.slice(0, 12).map((r) => ({
    name: r.short,
    Schools: r.schoolsPct,
    Consultants: r.consultantsPct,
    Meetings: r.meetingsPct,
    Coachings: r.coachingsPct,
  }));

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Targets vs achievement"
        subtitle="Leadership view only — compare Admin-set targets with field results. Not shown on B2B."
      />
      <ReportNav />

      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <Label>Region</Label>
          <Select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option>All</option>
            {regions.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>B2B Member</Label>
          <Select value={memberId} onChange={(e) => setMemberId(e.target.value)}>
            <option value="All">All</option>
            {b2b.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-[12rem] flex-1">
          <Label>Search</Label>
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email…" />
        </div>
      </div>

      <KpiSection title="Team attainment (avg %)">
        <Kpi label="Schools" value={`${teamAvg.schools}%`} tone="blue" />
        <Kpi label="Consultants" value={`${teamAvg.consultants}%`} tone="violet" />
        <Kpi label="Meetings" value={`${teamAvg.meetings}%`} tone="amber" />
        <Kpi label="Coachings" value={`${teamAvg.coachings}%`} tone="green" />
      </KpiSection>

      <ChartCard title="% of target by member" className="mb-4">
        {chartRows.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer>
              <BarChart data={chartRows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Legend />
                <Bar dataKey="Schools" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Consultants" fill={chartColors.violet} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Meetings" fill={chartColors.amber} radius={[4, 4, 0, 0]} />
                <Bar dataKey="Coachings" fill={chartColors.green} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="space-y-2 lg:hidden">
        {rows.map((r) => (
          <div key={r.id} className="card-surface p-3.5">
            <div className="text-sm font-semibold">{r.name}</div>
            <div className="text-xs text-[#6b6b6b]">
              {r.region} · {r.role}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="label-micro">Schools</div>
                <ProgressCell achieved={r.achieved.schools} target={r.target.schools} />
              </div>
              <div>
                <div className="label-micro">Consultants</div>
                <ProgressCell achieved={r.achieved.consultants} target={r.target.consultants} />
              </div>
              <div>
                <div className="label-micro">Meetings</div>
                <ProgressCell achieved={r.achieved.meetings} target={r.target.meetings} />
              </div>
              <div>
                <div className="label-micro">Coachings</div>
                <ProgressCell achieved={r.achieved.coachings} target={r.target.coachings} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto card-surface lg:block">
        <table className="ops-table-dense w-full min-w-[960px] text-left text-sm">
          <thead className="sticky top-0 bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
            <tr>
              <th className="px-3 py-2.5">User</th>
              <th className="px-3 py-2.5">Region</th>
              <th className="px-3 py-2.5">Schools</th>
              <th className="px-3 py-2.5">Consultants</th>
              <th className="px-3 py-2.5">Meetings</th>
              <th className="px-3 py-2.5">Coachings</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                <td className="px-3 py-2.5 font-medium">
                  {r.name}
                  <div className="text-xs font-normal text-[#6b6b6b]">{r.role}</div>
                </td>
                <td className="px-3 py-2.5 text-xs">{r.region}</td>
                <td className="px-3 py-2.5">
                  <ProgressCell achieved={r.achieved.schools} target={r.target.schools} />
                </td>
                <td className="px-3 py-2.5">
                  <ProgressCell achieved={r.achieved.consultants} target={r.target.consultants} />
                </td>
                <td className="px-3 py-2.5">
                  <ProgressCell achieved={r.achieved.meetings} target={r.target.meetings} />
                </td>
                <td className="px-3 py-2.5">
                  <ProgressCell achieved={r.achieved.coachings} target={r.target.coachings} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
