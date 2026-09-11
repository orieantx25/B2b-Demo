"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/reports", label: "Executive" },
  { href: "/reports/b2b", label: "B2B" },
  { href: "/reports/targets", label: "Targets" },
  { href: "/reports/consultants", label: "Consultants" },
  { href: "/reports/mou", label: "MOU" },
  { href: "/reports/weekly", label: "Weekly" },
] as const;

export function ReportNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Reports"
      className="mb-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {LINKS.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition",
              active
                ? "border-[#e31c24] bg-[#e31c24] text-white"
                : "border-[#e5e5e5] bg-white text-[#6b6b6b] hover:border-[#e31c24]/40"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
