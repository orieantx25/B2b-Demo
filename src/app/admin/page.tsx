"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Kpi, KpiSection, PageHeader } from "@/components/ui";
import { useProfiles } from "@/lib/api/hooks";
import { Users, KeyRound } from "lucide-react";

export default function AdminOverview() {
  const { user } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const active = profiles.filter((p) => p.active).length;
  const byRole = profiles.reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-in pb-8">
      <PageHeader
        title="Super Admin"
        subtitle={`Signed in as ${user?.name} · manage users and workspace access.`}
      />
      <KpiSection title="Directory">
        <Kpi label="Users" value={profiles.length} tone="violet" href="/admin/users" />
        <Kpi label="Active" value={active} tone="green" href="/admin/users" />
        <Kpi label="B2B" value={(byRole.b2b_member || 0) + (byRole.b2b_lead || 0)} tone="blue" />
        <Kpi label="Operations" value={byRole.operations || 0} tone="amber" />
        <Kpi label="Leadership" value={byRole.leadership || 0} tone="red" />
        <Kpi label="Admins" value={(byRole.admin || 0) + (byRole.super_admin || 0)} tone="ink" />
      </KpiSection>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[
          { href: "/admin/users", title: "Users & Roles", desc: "Add emails, assign roles", Icon: Users },
          { href: "/admin/access", title: "Access matrix", desc: "Who can open which workspace", Icon: KeyRound },
        ].map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="card-surface flex min-h-[6rem] flex-col justify-between p-4 transition hover:border-[#e31c24]/35"
          >
            <c.Icon className="h-5 w-5 text-[#e31c24]" />
            <div>
              <div className="text-sm font-semibold">{c.title}</div>
              <div className="text-xs text-[#6b6b6b]">{c.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
