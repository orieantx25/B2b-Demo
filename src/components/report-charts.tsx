"use client";

import type { ReactNode } from "react";
import { Panel } from "@/components/ui";
import { cn } from "@/lib/utils";

/** SoT-aligned chart palette — red primary, neutral secondaries */
export const chartColors = {
  red: "#e31c24",
  black: "#111111",
  muted: "#6b6b6b",
  border: "#e5e5e5",
  track: "#eeeeee",
  green: "#1b7a4e",
  amber: "#b45309",
  blue: "#1d4ed8",
  violet: "#7c3aed",
  softRed: "#f5c2c4",
  softGreen: "#b7dfc9",
  softAmber: "#f0d2ad",
  softBlue: "#bfdbfe",
} as const;

export const SERIES = [
  chartColors.red,
  chartColors.black,
  chartColors.blue,
  chartColors.amber,
  chartColors.green,
  chartColors.muted,
] as const;

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <Panel title={title} action={action} className={cn(className)}>
      <div className="p-4 sm:p-5">
        {subtitle && <p className="mb-4 text-xs text-[#6b6b6b]">{subtitle}</p>}
        {children}
      </div>
    </Panel>
  );
}

export function chartTooltipStyle() {
  return {
    backgroundColor: "#ffffff",
    border: `1px solid ${chartColors.border}`,
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 1px 2px rgba(17,17,17,0.06)",
  };
}

export function ChartEmpty({ label = "No data to chart yet" }: { label?: string }) {
  return (
    <div className="flex h-48 items-center justify-center rounded-[10px] border border-dashed border-[#e5e5e5] bg-[#fafafa] text-sm text-[#6b6b6b]">
      {label}
    </div>
  );
}
