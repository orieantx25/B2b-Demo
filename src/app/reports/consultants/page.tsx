"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useAppStore } from "@/store/app-store";
import { Badge, Kpi, KpiSection, PageHeader, StatusTone } from "@/components/ui";
import { ChartCard, ChartEmpty, SERIES, chartColors, chartTooltipStyle } from "@/components/report-charts";
import { ReportNav } from "@/components/report-nav";

export default function ConsultantPerfReport() {
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const meetings = useAppStore((s) => s.meetings);
  const utms = useAppStore((s) => s.utms);

  const topByLeads = useMemo(
    () =>
      [...consultants]
        .sort((a, b) => b.leadsCount - a.leadsCount)
        .slice(0, 8)
        .map((c) => ({
          name: c.name.split(" ")[0] || c.name,
          fullName: c.name,
          leads: c.leadsCount,
          admissions: c.admissionsCount,
          testTakers: c.testTakersCount,
        })),
    [consultants]
  );

  const statusMix = useMemo(() => {
    const counts = new Map<string, number>();
    consultants.forEach((c) => counts.set(c.status, (counts.get(c.status) || 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [consultants]);

  const scatter = useMemo(
    () =>
      consultants
        .filter((c) => c.leadsCount > 0 || c.admissionsCount > 0)
        .slice(0, 60)
        .map((c) => ({
          leads: c.leadsCount,
          admissions: c.admissionsCount,
          testTakers: c.testTakersCount,
          name: c.name,
        })),
    [consultants]
  );

  const totals = useMemo(
    () => ({
      leads: consultants.reduce((a, c) => a + c.leadsCount, 0),
      tt: consultants.reduce((a, c) => a + c.testTakersCount, 0),
      adm: consultants.reduce((a, c) => a + c.admissionsCount, 0),
      active: consultants.filter((c) => c.status === "Active").length,
    }),
    [consultants]
  );

  const topTable = useMemo(
    () =>
      [...consultants]
        .sort((a, b) => b.leadsCount - a.leadsCount)
        .slice(0, 20),
    [consultants]
  );

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Consultant Performance"
        subtitle="Who is converting — leads, test takers, and admissions."
      />
      <ReportNav />

      <KpiSection title="Portfolio totals">
        <Kpi label="Consultants" value={consultants.length} tone="violet" />
        <Kpi label="Active" value={totals.active} tone="green" />
        <Kpi label="Leads" value={totals.leads} tone="blue" />
        <Kpi label="Test takers" value={totals.tt} tone="amber" />
        <Kpi label="Admissions" value={totals.adm} tone="red" />
        <Kpi
          label="Conv. rate"
          value={totals.leads ? `${Math.round((totals.adm / totals.leads) * 100)}%` : "0%"}
          tone="green"
          hint="Admissions / leads"
        />
      </KpiSection>

      <div className="mb-4 grid gap-4 lg:grid-cols-5">
        <ChartCard title="Top consultants by leads" subtitle="Top 8 by attributed leads" className="lg:col-span-3">
          {topByLeads.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topByLeads} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={72}
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                  />
                  <Tooltip
                    contentStyle={chartTooltipStyle()}
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="leads" name="Leads" fill={chartColors.red} radius={[0, 4, 4, 0]} barSize={10} />
                  <Bar dataKey="admissions" name="Admissions" fill={chartColors.black} radius={[0, 4, 4, 0]} barSize={10} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Status mix" className="lg:col-span-2">
          {statusMix.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {statusMix.map((_, i) => (
                      <Cell key={i} fill={SERIES[i % SERIES.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <ChartCard
        title="Leads vs admissions"
        subtitle="Each point is a consultant — bubble size reflects test takers"
        className="mb-4"
      >
        {scatter.length === 0 ? (
          <ChartEmpty />
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="leads"
                  name="Leads"
                  tick={{ fontSize: 11, fill: chartColors.muted }}
                  label={{ value: "Leads", position: "insideBottom", offset: -2, fontSize: 11 }}
                />
                <YAxis
                  type="number"
                  dataKey="admissions"
                  name="Admissions"
                  tick={{ fontSize: 11, fill: chartColors.muted }}
                  label={{ value: "Admissions", angle: -90, position: "insideLeft", fontSize: 11 }}
                />
                <ZAxis type="number" dataKey="testTakers" range={[40, 220]} name="Test takers" />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={chartTooltipStyle()}
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={() => ""}
                />
                <Scatter name="Consultants" data={scatter} fill={chartColors.red} fillOpacity={0.65} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        )}
      </ChartCard>

      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">
        Top consultants by leads
      </div>
      <div className="space-y-2 sm:hidden">
        {topTable.map((c) => (
          <Link key={c.id} href={`/consultants/${c.id}`} className="block card-surface p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{c.name}</div>
                <div className="mt-0.5 text-xs text-[#6b6b6b]">
                  {members.find((m) => m.id === c.ownerId)?.name}
                </div>
              </div>
              <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-[#6b6b6b]">
              <div>Leads · <strong className="text-[#111111]">{c.leadsCount}</strong></div>
              <div>TT · <strong className="text-[#111111]">{c.testTakersCount}</strong></div>
              <div>Adm · <strong className="text-[#111111]">{c.admissionsCount}</strong></div>
            </div>
          </Link>
        ))}
      </div>
      <div className="hidden overflow-x-auto card-surface sm:block">
        <table className="w-full min-w-[1000px] text-left text-sm">
          <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
            <tr>
              <th className="px-3 py-2">Consultant</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">Meetings</th>
              <th className="px-3 py-2">MOU</th>
              <th className="px-3 py-2">Active</th>
              <th className="px-3 py-2">UTMs</th>
              <th className="px-3 py-2">Leads</th>
              <th className="px-3 py-2">Test takers</th>
              <th className="px-3 py-2">Admissions</th>
            </tr>
          </thead>
          <tbody>
            {topTable.map((c) => (
              <tr key={c.id} className="border-t border-[#e5e5e5]">
                <td className="px-3 py-2">
                  <Link href={`/consultants/${c.id}`} className="font-medium hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-3 py-2 text-xs">{members.find((m) => m.id === c.ownerId)?.name}</td>
                <td className="px-3 py-2">{meetings.filter((m) => m.consultantId === c.id).length}</td>
                <td className="px-3 py-2 text-xs">{c.mouStatus}</td>
                <td className="px-3 py-2">
                  <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
                </td>
                <td className="px-3 py-2">{utms.filter((u) => u.consultantId === c.id).length}</td>
                <td className="px-3 py-2">{c.leadsCount}</td>
                <td className="px-3 py-2">{c.testTakersCount}</td>
                <td className="px-3 py-2">{c.admissionsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
