"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Kpi, KpiSection, PageHeader, Panel } from "@/components/ui";
import { useProfiles } from "@/lib/api/hooks";
import { Users, KeyRound, Settings, FileBarChart, Target } from "lucide-react";

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
        subtitle={`Signed in as ${user?.name} · assign emails, roles, and workspace access.`}
      />
      <KpiSection title="Directory">
        <Kpi label="Users" value={profiles.length} tone="violet" href="/admin/users" />
        <Kpi label="Active" value={active} tone="green" href="/admin/users" />
        <Kpi label="B2B" value={(byRole.b2b_member || 0) + (byRole.b2b_lead || 0)} tone="blue" />
        <Kpi label="Operations" value={byRole.operations || 0} tone="amber" />
        <Kpi label="Leadership" value={byRole.leadership || 0} tone="red" />
        <Kpi label="Admins" value={(byRole.admin || 0) + (byRole.super_admin || 0)} tone="ink" />
      </KpiSection>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {[
          { href: "/admin/users", title: "Users & Roles", desc: "Add emails, assign roles", Icon: Users },
          {
            href: "/admin/targets",
            title: "User targets",
            desc: "Schools, consultants, meetings, coachings",
            Icon: Target,
          },
          { href: "/admin/access", title: "Access matrix", desc: "Who can open which workspace", Icon: KeyRound },
          { href: "/admin/settings", title: "Settings", desc: "Legacy portal URLs", Icon: Settings },
          { href: "/admin/audit", title: "Audit", desc: "Org activity feed", Icon: FileBarChart },
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

      <Panel title="How login works" className="mt-4">
        <div className="space-y-2 px-4 py-4 text-sm text-[#6b6b6b]">
          <p>
            Users sign in with their assigned email only (no password). The portal validates the email,
            loads the role, and routes them to the correct workspace.
          </p>
          <p>
            Super Admin: <code className="rounded bg-[#f0f0f0] px-1">superadmin@ugsot.edu</code>
          </p>
        </div>
      </Panel>
    </div>
  );
}
