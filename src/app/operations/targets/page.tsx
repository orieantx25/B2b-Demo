"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  PageHeader,
} from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { emptyTargets } from "@/lib/user-targets";
import { Target } from "lucide-react";

export default function OpsTargetsPage() {
  const members = useAppStore((s) => s.members);
  const userTargets = useAppStore((s) => s.userTargets);
  const setUserTargets = useAppStore((s) => s.setUserTargets);

  const b2b = useMemo(
    () => members.filter((m) => m.role === "B2B Member" || m.role === "B2B Lead"),
    [members]
  );

  const [q, setQ] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    schools: 0,
    consultants: 0,
    meetings: 0,
    coachings: 0,
  });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return b2b.filter(
      (m) =>
        !s ||
        m.name.toLowerCase().includes(s) ||
        m.email.toLowerCase().includes(s) ||
        m.region.toLowerCase().includes(s)
    );
  }, [b2b, q]);

  const targetFor = (userId: string) =>
    userTargets.find((t) => t.userId === userId) || emptyTargets(userId);

  const openEdit = (userId: string) => {
    const t = targetFor(userId);
    setForm({
      schools: t.schools,
      consultants: t.consultants,
      meetings: t.meetings,
      coachings: t.coachings,
    });
    setEditingId(userId);
  };

  const editing = editingId ? members.find((m) => m.id === editingId) : null;

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="User targets"
        subtitle="Set schools, consultants, meetings, and coachings targets per B2B user. Achievement appears in Reports — not on the B2B portal."
      />

      <div className="mb-4 max-w-md">
        <Label htmlFor="ops-target-search">Search users</Label>
        <Input
          id="ops-target-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, region…"
        />
      </div>

      {list.length === 0 ? (
        <EmptyState title="No B2B users" description="Ask Admin to add B2B members under Users & Roles." />
      ) : (
        <>
          <div className="space-y-2 lg:hidden">
            {list.map((m) => {
              const t = targetFor(m.id);
              return (
                <div key={m.id} className="card-surface p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="text-xs text-[#6b6b6b]">
                        {m.role} · {m.region}
                      </div>
                    </div>
                    <Badge tone="info">{m.role === "B2B Lead" ? "Lead" : "Member"}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      Schools <strong>{t.schools}</strong>
                    </div>
                    <div>
                      Consultants <strong>{t.consultants}</strong>
                    </div>
                    <div>
                      Meetings <strong>{t.meetings}</strong>
                    </div>
                    <div>
                      Coachings <strong>{t.coachings}</strong>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="mt-3 min-h-11 w-full" onClick={() => openEdit(m.id)}>
                    <Target className="h-3.5 w-3.5" /> Edit targets
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto card-surface lg:block">
            <table className="ops-table-dense w-full min-w-[900px] text-left text-sm">
              <thead className="sticky top-0 bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                <tr>
                  <th className="px-3 py-2.5">User</th>
                  <th className="px-3 py-2.5">Region</th>
                  <th className="px-3 py-2.5">Schools</th>
                  <th className="px-3 py-2.5">Consultants</th>
                  <th className="px-3 py-2.5">Meetings</th>
                  <th className="px-3 py-2.5">Coachings</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => {
                  const t = targetFor(m.id);
                  return (
                    <tr key={m.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                      <td className="px-3 py-2.5">
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-[#6b6b6b]">{m.email}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs">{m.region}</td>
                      <td className="px-3 py-2.5 tabular-nums">{t.schools}</td>
                      <td className="px-3 py-2.5 tabular-nums">{t.consultants}</td>
                      <td className="px-3 py-2.5 tabular-nums">{t.meetings}</td>
                      <td className="px-3 py-2.5 tabular-nums">{t.coachings}</td>
                      <td className="px-3 py-2.5">
                        <Button size="sm" variant="outline" onClick={() => openEdit(m.id)}>
                          Edit targets
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal
        open={!!editingId}
        onClose={() => setEditingId(null)}
        title={editing ? `Targets · ${editing.name}` : "Targets"}
      >
        <p className="mb-3 text-sm text-[#6b6b6b]">
          These numbers are leadership goals only. B2B users never see them in their portal.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["schools", "Schools"],
              ["consultants", "Consultants"],
              ["meetings", "Meetings"],
              ["coachings", "Coachings"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <Label htmlFor={`ops-t-${key}`}>{label} target</Label>
              <Input
                id={`ops-t-${key}`}
                type="number"
                min={0}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: Number(e.target.value) || 0 })}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditingId(null)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!editingId) return;
              setUserTargets({ userId: editingId, ...form });
              setEditingId(null);
            }}
          >
            Save targets
          </Button>
        </div>
      </Modal>
    </div>
  );
}
