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
import { Input, Kpi, KpiSection, Label, PageHeader, Select } from "@/components/ui";
import { ChartCard, ChartEmpty, chartColors, chartTooltipStyle } from "@/components/report-charts";

export default function B2BPerfReport() {
  const members = useAppStore((s) => s.members);
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const leads = useAppStore((s) => s.leads);
  const admissions = useAppStore((s) => s.admissions);

  const [region, setRegion] = useState("All");
  const [memberId, setMemberId] = useState("All");

  const b2b = members.filter((m) => m.role === "B2B Member" || m.role === "B2B Lead");

  const rows = useMemo(() => {
    return b2b
      .filter((m) => region === "All" || m.region === region)
      .filter((m) => memberId === "All" || m.id === memberId)
      .map((m) => {
        const cs = consultants.filter((c) => c.ownerId === m.id);
        const ids = new Set(cs.map((c) => c.id));
        return {
          name: m.name.split(" ")[0] || m.name,
          fullName: m.name,
          meetings: meetings.filter((x) => x.ownerId === m.id).length,
          consultants: cs.length,
          active: cs.filter((c) => c.status === "Active").length,
          leads: leads.filter((l) => ids.has(l.consultantId)).length,
          admissions: admissions.filter((a) => ids.has(a.consultantId)).length,
        };
      });
  }, [b2b, region, memberId, consultants, meetings, leads, admissions]);

  const regions = Array.from(new Set(members.map((m) => m.region)));
  const totals = useMemo(
    () => ({
      meetings: rows.reduce((a, r) => a + r.meetings, 0),
      consultants: rows.reduce((a, r) => a + r.consultants, 0),
      active: rows.reduce((a, r) => a + r.active, 0),
      leads: rows.reduce((a, r) => a + r.leads, 0),
      admissions: rows.reduce((a, r) => a + r.admissions, 0),
    }),
    [rows]
  );

  const chartRows = rows.slice(0, 10);

  return (
    <div className="animate-in pb-16">
      <PageHeader title="B2B Performance" subtitle="Filter by region and member — compare field productivity." />
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
        <div>
          <Label>Date (demo)</Label>
          <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
        </div>
      </div>

      <KpiSection title="Filtered totals">
        <Kpi label="Meetings" value={totals.meetings} tone="blue" />
        <Kpi label="Consultants" value={totals.consultants} tone="violet" />
        <Kpi label="Active" value={totals.active} tone="green" />
        <Kpi label="Leads" value={totals.leads} tone="blue" />
        <Kpi label="Admissions" value={totals.admissions} tone="red" />
        <Kpi
          label="Lead / Active"
          value={totals.active ? Math.round(totals.leads / totals.active) : 0}
          tone="amber"
          hint="Avg leads per active"
        />
      </KpiSection>

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Pipeline by member" subtitle="Meetings vs consultants vs active">
          {chartRows.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartColors.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="meetings" name="Meetings" fill={chartColors.blue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consultants" name="Consultants" fill={chartColors.black} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="Active" fill={chartColors.green} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Downstream by member" subtitle="Leads and admissions attributed to owned consultants">
          {chartRows.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartRows} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartColors.muted }} />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="leads" name="Leads" fill={chartColors.red} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="admissions" name="Admissions" fill={chartColors.amber} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="overflow-x-auto card-surface">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
            <tr>
              <th className="px-3 py-2">B2B Member</th>
              <th className="px-3 py-2">Meetings</th>
              <th className="px-3 py-2">Consultants</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">Leads</th>
              <th className="px-3 py-2">Admissions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.fullName} className="border-t border-[#e5e5e5]">
                <td className="px-3 py-2 font-medium">{r.fullName}</td>
                <td className="px-3 py-2">{r.meetings}</td>
                <td className="px-3 py-2">{r.consultants}</td>
                <td className="px-3 py-2">{r.active}</td>
                <td className="px-3 py-2">{r.leads}</td>
                <td className="px-3 py-2">{r.admissions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
