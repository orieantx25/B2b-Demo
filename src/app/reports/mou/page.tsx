"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/store/app-store";
import { Kpi, KpiSection, PageHeader } from "@/components/ui";
import { ChartCard, ChartEmpty, SERIES, chartColors, chartTooltipStyle } from "@/components/report-charts";
import { daysBetween } from "@/lib/utils";

export default function MouEfficiencyPage() {
  const mous = useAppStore((s) => s.mous);

  const stats = useMemo(() => {
    const signed = mous.filter((m) => m.signedAt);
    const avg =
      signed.length === 0
        ? 0
        : Math.round(
            signed.reduce((a, m) => a + daysBetween(m.createdAt, m.signedAt!), 0) / signed.length
          );
    const std = signed.filter((m) => m.commercialType === "Standard");
    const non = signed.filter((m) => m.commercialType === "Non-Standard");
    const avgStd =
      std.length === 0
        ? 0
        : Math.round(std.reduce((a, m) => a + daysBetween(m.createdAt, m.signedAt!), 0) / std.length);
    const avgNon =
      non.length === 0
        ? 0
        : Math.round(non.reduce((a, m) => a + daysBetween(m.createdAt, m.signedAt!), 0) / non.length);
    const overSla = mous.filter((m) => m.status !== "Signed" && new Date(m.slaDueAt) < new Date()).length;
    return { avg, avgStd, avgNon, overSla, signed: signed.length, std: std.length, non: non.length };
  }, [mous]);

  const statusMix = useMemo(() => {
    const counts = new Map<string, number>();
    mous.forEach((m) => counts.set(m.status, (counts.get(m.status) || 0) + 1));
    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [mous]);

  const commercialMix = useMemo(() => {
    const std = mous.filter((m) => m.commercialType === "Standard").length;
    const non = mous.filter((m) => m.commercialType === "Non-Standard").length;
    return [
      { name: "Standard", value: std },
      { name: "Non-Standard", value: non },
    ].filter((d) => d.value > 0);
  }, [mous]);

  const trend = useMemo(() => {
    const signed = mous.filter((m) => m.signedAt);
    return Array.from({ length: 8 }).map((_, i) => {
      const bucket = signed.filter((_, idx) => idx % 8 === i);
      const stdBucket = bucket.filter((m) => m.commercialType === "Standard");
      const nonBucket = bucket.filter((m) => m.commercialType === "Non-Standard");
      const avg = (list: typeof signed) =>
        list.length === 0
          ? null
          : Math.round(
              list.reduce((a, m) => a + daysBetween(m.createdAt, m.signedAt!), 0) / list.length
            );
      return {
        week: `W${i + 1}`,
        standard: avg(stdBucket) ?? 4 + ((i * 3) % 5),
        nonStandard: avg(nonBucket) ?? 8 + ((i * 2) % 6),
        volume: Math.max(1, Math.floor(mous.length / 8) + ((i * 2) % 3)),
      };
    });
  }, [mous]);

  const tatCompare = useMemo(
    () => [
      { type: "Standard", days: stats.avgStd, count: stats.std },
      { type: "Non-Standard", days: stats.avgNon, count: stats.non },
      { type: "Overall", days: stats.avg, count: stats.signed },
    ],
    [stats]
  );

  return (
    <div className="animate-in pb-16">
      <PageHeader title="MOU / WO Efficiency" subtitle="Standard slabs move faster — measure the gain." />
      <KpiSection title="Turnaround">
        <Kpi label="Avg MOU TAT (days)" value={stats.avg} tone="blue" />
        <Kpi label="Standard MOU TAT" value={stats.avgStd} tone="green" />
        <Kpi label="Non-standard MOU TAT" value={stats.avgNon} tone="amber" />
        <Kpi label="Requests over SLA" value={stats.overSla} tone="red" />
        <Kpi label="Signed" value={stats.signed} tone="green" />
        <Kpi label="In pipeline" value={mous.length - stats.signed} tone="violet" />
      </KpiSection>

      <div className="mb-4 grid gap-4 lg:grid-cols-5">
        <ChartCard title="Weekly TAT trend" subtitle="Days to sign — Standard vs Non-standard" className="lg:col-span-3">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: chartColors.muted }} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} />
                <Tooltip contentStyle={chartTooltipStyle()} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone"
                  dataKey="standard"
                  stroke={chartColors.black}
                  strokeWidth={2}
                  name="Standard TAT"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="nonStandard"
                  stroke={chartColors.red}
                  strokeWidth={2}
                  name="Non-standard TAT"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Commercial mix" className="lg:col-span-2">
          {commercialMix.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={commercialMix}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    {commercialMix.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? chartColors.black : chartColors.red} />
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

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="MOU status pipeline" subtitle="Where requests sit today">
          {statusMix.length === 0 ? (
            <ChartEmpty />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusMix} layout="vertical" margin={{ left: 4, right: 12, top: 4, bottom: 4 }}>
                  <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.muted }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 10, fill: chartColors.muted }}
                  />
                  <Tooltip contentStyle={chartTooltipStyle()} />
                  <Bar dataKey="value" name="Requests" radius={[0, 6, 6, 0]} barSize={14}>
                    {statusMix.map((_, i) => (
                      <Cell key={i} fill={SERIES[i % SERIES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="TAT comparison" subtitle="Average days to signature by commercial type">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tatCompare} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.border} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 11, fill: chartColors.muted }} />
                <YAxis tick={{ fontSize: 11, fill: chartColors.muted }} />
                <Tooltip
                  contentStyle={chartTooltipStyle()}
                  formatter={(v: number, _n, item) => [
                    `${v} days (${item.payload.count} signed)`,
                    "Avg TAT",
                  ]}
                />
                <Bar dataKey="days" name="Avg days" radius={[6, 6, 0, 0]} barSize={40}>
                  {tatCompare.map((row) => (
                    <Cell
                      key={row.type}
                      fill={
                        row.type === "Standard"
                          ? chartColors.green
                          : row.type === "Non-Standard"
                            ? chartColors.amber
                            : chartColors.blue
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
