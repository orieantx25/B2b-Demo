"use client";

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
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/store/app-store";
import { Kpi, KpiSection, PageHeader, SourceTag } from "@/components/ui";
import { ChartCard, ChartEmpty, SERIES, chartColors, chartTooltipStyle } from "@/components/report-charts";
import { ReportNav } from "@/components/report-nav";

export default function ReportsOverview() {
  const meetings = useAppStore((s) => s.meetings);
  const consultants = useAppStore((s) => s.consultants);
  const mous = useAppStore((s) => s.mous);
  const leads = useAppStore((s) => s.leads);
  const testTakers = useAppStore((s) => s.testTakers);
  const admissions = useAppStore((s) => s.admissions);

  const lifecycleFunnel = useMemo(
    () => [
      { stage: "Meetings", value: meetings.length },
      { stage: "Consultants", value: consultants.length },
      { stage: "MOU requested", value: mous.length },
      { stage: "MOU signed", value: mous.filter((m) => m.status === "Signed").length },
      { stage: "Active", value: consultants.filter((c) => c.status === "Active").length },
    ],
    [meetings, consultants, mous]
  );

  const commercialFunnel = useMemo(
    () => [
      { stage: "Leads", value: leads.length },
      { stage: "Test takers", value: testTakers.length },
      { stage: "Admissions", value: admissions.length },
    ],
    [leads, testTakers, admissions]
  );

  const statusMix = useMemo(() => {
    const counts = new Map<string, number>();
    consultants.forEach((c) => counts.set(c.status, (counts.get(c.status) || 0) + 1));
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [consultants]);

  const regionMix = useMemo(() => {
    const counts = new Map<string, number>();
    consultants.forEach((c) => counts.set(c.region || "Unknown", (counts.get(c.region) || 0) + 1));
    return Array.from(counts.entries())
      .map(([region, count]) => ({ region, consultants: count }))
      .sort((a, b) => b.consultants - a.consultants)
      .slice(0, 8);
  }, [consultants]);

  const conversion = useMemo(() => {
    const active = consultants.filter((c) => c.status === "Active").length;
    const signed = mous.filter((m) => m.status === "Signed").length;
    return [
      {
        label: "Meeting → Consultant",
        rate: meetings.length ? Math.round((consultants.length / meetings.length) * 100) : 0,
      },
      {
        label: "Consultant → MOU signed",
        rate: consultants.length ? Math.round((signed / consultants.length) * 100) : 0,
      },
      {
        label: "MOU → Active",
        rate: signed ? Math.round((active / signed) * 100) : 0,
      },
      {
        label: "Lead → Admission",
        rate: leads.length ? Math.round((admissions.length / leads.length) * 100) : 0,
      },
    ];
  }, [meetings, consultants, mous, leads, admissions]);

  const active = consultants.filter((c) => c.status === "Active").length;
  const mouSigned = mous.filter((m) => m.status === "Signed").length;

  return (
    <div className="animate-in pb-8 sm:pb-16">
      <PageHeader
        title="Executive Overview"
        subtitle="uGSOT B2B Operations — consultant lifecycle at a glance."
      />
      <ReportNav />
      <KpiSection title="Lifecycle snapshot">
        <Kpi label="Meetings" value={meetings.length} tone="blue" href="/reports/b2b" />
        <Kpi label="Consultants" value={consultants.length} tone="violet" href="/reports/consultants" />
        <Kpi
          label="Active"
          value={active}
          tone="green"
          hint={
            consultants.length
              ? `${Math.round((active / consultants.length) * 100)}% of consultants`
              : undefined
          }
          href="/reports/consultants"
        />
        <Kpi
          label="MOU Signed"
          value={mouSigned}
          tone="amber"
          hint={mous.length ? `${Math.round((mouSigned / mous.length) * 100)}% of MOUs` : undefined}
          href="/reports/mou"
        />
        <Kpi label="Leads" value={leads.length} tone="blue" href="/reports/b2b" />
        <Kpi
          label="Admissions"
          value={admissions.length}
          tone="red"
          hint={
            leads.length
              ? `${Math.round((admissions.length / leads.length) * 100)}% of leads`
              : undefined
          }
          href="/reports/b2b"
        />
      </KpiSection>

      <div className="grid gap-4 lg:grid-cols-5">
        <ChartCard
          title="Lifecycle funnel"
          subtitle="Meeting → Active"
          className="lg:col-span-3"
        >
          {lifecycleFunnel.every((f) => f.value === 0) ? (
            <ChartEmpty />
          ) : (
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={lifecycleFunnel}
                  layout="vertical"
                  margin={{ left: 8, right: 12, top: 4, bottom: 4 }}
                >
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} />
                  <YAxis
                    type="category"
                    dataKey="stage"
                    width={92}
                    tick={{ fontSize: 11, fill: chartColors.muted }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]} fill={chartColors.red} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Consultant status mix" subtitle="Share by lifecycle status" className="lg:col-span-2">
          {statusMix.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={88}
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

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Commercial funnel" subtitle="Leads → Admissions">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={commercialFunnel}
                layout="vertical"
                margin={{ left: 8, right: 12, top: 4, bottom: 4 }}
              >
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={80}
                  tick={{ fontSize: 11, fill: chartColors.muted }}
                />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Bar dataKey="value" name="Count" radius={[0, 6, 6, 0]} fill={chartColors.black} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Conversion rates" subtitle="Stage-to-stage efficiency (%)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={conversion}
                layout="vertical"
                margin={{ left: 8, right: 12, top: 4, bottom: 4 }}
              >
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: chartColors.muted }} unit="%" />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={130}
                  tick={{ fontSize: 10, fill: chartColors.muted }}
                />
                <Tooltip contentStyle={chartTooltipStyle()} formatter={(v: number) => [`${v}%`, "Rate"]} />
                <Bar dataKey="rate" name="Conversion %" radius={[0, 6, 6, 0]} fill={chartColors.red} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Consultants by region" subtitle="Top regions in the portfolio">
          {regionMix.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionMix} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="region"
                    tick={{ fontSize: 10, fill: chartColors.muted }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={56}
                  />
                  <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Bar dataKey="consultants" name="Consultants" fill={chartColors.black} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <div className="card-surface flex flex-col justify-center gap-3 p-5">
          <div className="text-sm font-semibold text-[#111111]">Synced systems</div>
          <p className="text-xs text-[#6b6b6b]">
            Downstream volumes are mirrored from existing systems — not owned here.
          </p>
          <div className="flex flex-wrap gap-2">
            <SourceTag>Lead System · {leads.length}</SourceTag>
            <SourceTag>Exam System · {testTakers.length}</SourceTag>
            <SourceTag>Admission System · {admissions.length}</SourceTag>
          </div>
        </div>
      </div>
    </div>
  );
}
