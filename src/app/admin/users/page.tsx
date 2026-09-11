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
  Select,
} from "@/components/ui";
import { useProfiles, useSaveProfile, useToggleProfileActive } from "@/lib/api/hooks";
import type { AppRole, Profile } from "@/lib/auth/roles";
import { useAppStore } from "@/store/app-store";

const ROLES: { id: AppRole; label: string }[] = [
  { id: "super_admin", label: "Super Admin" },
  { id: "admin", label: "Admin" },
  { id: "b2b_member", label: "B2B Member" },
  { id: "b2b_lead", label: "B2B Lead" },
  { id: "operations", label: "Operations" },
  { id: "leadership", label: "Leadership" },
];

export default function AdminUsersPage() {
  const { data: profiles = [], isLoading, error, refetch } = useProfiles();
  const save = useSaveProfile();
  const toggle = useToggleProfileActive();
  const addToast = useAppStore((s) => s.addToast);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    email: "",
    name: "",
    role: "b2b_member" as AppRole,
    region: "NCR",
  });

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return profiles;
    return profiles.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.email.toLowerCase().includes(s) ||
        p.role.includes(s)
    );
  }, [profiles, q]);

  const openCreate = () => {
    setEditing(null);
    setForm({ email: "", name: "", role: "b2b_member", region: "NCR" });
    setOpen(true);
  };

  const openEdit = (p: Profile) => {
    setEditing(p);
    setForm({ email: p.email, name: p.name, role: p.role, region: p.region });
    setOpen(true);
  };

  const onSave = async () => {
    try {
      await save.mutateAsync({
        id: editing?.id,
        ...form,
        active: editing?.active ?? true,
      });
      addToast({ title: editing ? "User updated" : "User created", variant: "success" });
      setOpen(false);
    } catch (e) {
      addToast({ title: e instanceof Error ? e.message : "Save failed", variant: "error" });
    }
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Users & Roles"
        subtitle="Assign emails with roles. Login validates email → role → workspace."
        actions={<Button onClick={openCreate}>Add user</Button>}
      />
      <div className="mb-4 max-w-md">
        <Label htmlFor="user-search">Search</Label>
        <Input
          id="user-search"
          aria-label="Search users"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Name, email, role…"
        />
      </div>

      {isLoading && <p className="text-sm text-[#6b6b6b]">Loading users…</p>}
      {error && (
        <EmptyState
          title="Could not load users"
          description="Retry or check your session."
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        />
      )}

      {!isLoading && !error && list.length === 0 && (
        <EmptyState title="No users" description="Add an email and assign a role." action={<Button onClick={openCreate}>Add user</Button>} />
      )}

      <div className="space-y-2 lg:hidden">
        {list.map((p) => (
          <div key={p.id} className="card-surface p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{p.name}</div>
                <div className="text-xs text-[#6b6b6b]">{p.email}</div>
              </div>
              <Badge tone={p.active ? "success" : "danger"}>{p.active ? "Active" : "Off"}</Badge>
            </div>
            <div className="mt-2 text-xs text-[#6b6b6b]">
              {p.role} · {p.region}
            </div>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  void toggle.mutateAsync({ id: p.id, active: !p.active }).then(() =>
                    addToast({ title: p.active ? "Deactivated" : "Activated", variant: "success" })
                  )
                }
              >
                {p.active ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto card-surface lg:block">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="sticky top-0 bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
            <tr>
              <th className="px-3 py-2.5">Name</th>
              <th className="px-3 py-2.5">Email</th>
              <th className="px-3 py-2.5">Role</th>
              <th className="px-3 py-2.5">Region</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                <td className="px-3 py-2.5 font-medium">{p.name}</td>
                <td className="px-3 py-2.5 text-xs">{p.email}</td>
                <td className="px-3 py-2.5 text-xs">{p.role}</td>
                <td className="px-3 py-2.5 text-xs">{p.region}</td>
                <td className="px-3 py-2.5">
                  <Badge tone={p.active ? "success" : "danger"}>{p.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void toggle.mutateAsync({ id: p.id, active: !p.active })}
                    >
                      {p.active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Edit user" : "Add user"}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="u-name">Full name *</Label>
            <Input id="u-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="u-email">Email *</Label>
            <Input
              id="u-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="u-role">Role</Label>
            <Select
              id="u-role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as AppRole })}
            >
              {ROLES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="u-region">Region</Label>
            <Select
              id="u-region"
              value={form.region}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
            >
              {["NCR", "North", "South", "East", "West", "Maharashtra", "Karnataka"].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </Select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || !form.email || save.isPending} onClick={() => void onSave()}>
            Save
          </Button>
        </div>
      </Modal>
    </div>
  );
}
