"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Label,
  Modal,
  PageHeader,
  Select,
  StatusTone,
} from "@/components/ui";
import { CardxUpload, type CardxExtract } from "@/components/cardx-upload";
import type { Consultant } from "@/types";

export default function ConsultantsPage() {
  const router = useRouter();
  const consultants = useAppStore((s) => s.consultants);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);
  const createConsultant = useAppStore((s) => s.createConsultant);
  const findDuplicates = useAppStore((s) => s.findDuplicates);
  const requestMerge = useAppStore((s) => s.requestMerge);
  const sendMarketingMaterial = useAppStore((s) => s.sendMarketingMaterial);
  const addToast = useAppStore((s) => s.addToast);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [cardx, setCardx] = useState(false);
  const [dups, setDups] = useState<Consultant[]>([]);
  const [form, setForm] = useState({
    name: "",
    organization: "",
    phone: "",
    email: "",
    region: "NCR",
    designation: "",
  });

  const scoped = useMemo(() => {
    let rows = consultants;
    if (persona === "b2b") rows = rows.filter((c) => c.ownerId === currentUserId);
    return rows;
  }, [consultants, persona, currentUserId]);

  const list = useMemo(() => {
    let rows = scoped;
    if (q) {
      const s = q.toLowerCase();
      rows = rows.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.organization.toLowerCase().includes(s) ||
          c.consultantCode.toLowerCase().includes(s) ||
          c.phone.includes(s) ||
          c.email.toLowerCase().includes(s)
      );
    }
    return rows.slice(0, 100);
  }, [scoped, q]);

  const isSearchEmpty = list.length === 0 && q.trim().length > 0;
  const isTrueEmpty = scoped.length === 0;

  const tryCreate = () => {
    if (form.phone.trim().length < 8) {
      addToast({
        title: "Phone required",
        description: "Enter a valid phone before creating the consultant.",
      });
      return;
    }
    const found = findDuplicates(form.name, form.phone, form.email);
    if (found.length) {
      setDups(found);
      return;
    }
    const { consultant } = createConsultant(form);
    setOpen(false);
    router.push(`/consultants/${consultant.id}`);
  };

  const onCardx = (data: CardxExtract) => {
    setForm({
      name: data.name,
      organization: data.organization,
      phone: data.phone,
      email: data.email,
      region: "NCR",
      designation: data.designation,
    });
    setOpen(true);
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="My Consultants"
        subtitle="Open 360 for the full journey. Schedule from any row."
        actions={
          <>
            <Button variant="outline" onClick={() => setCardx(true)}>
              Scan card
            </Button>
            <Button onClick={() => setOpen(true)}>Create consultant</Button>
          </>
        }
      />
      <div className="mb-4">
        <Label htmlFor="consultant-search">Search</Label>
        <Input
          id="consultant-search"
          aria-label="Search consultants"
          placeholder="Name, org, code, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {isTrueEmpty ? (
        <EmptyState
          title="No consultants yet"
          description="Scan a visiting card or create a consultant after a meeting."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={() => setCardx(true)}>
                Scan card
              </Button>
              <Button onClick={() => setOpen(true)}>Create</Button>
            </div>
          }
        />
      ) : isSearchEmpty ? (
        <EmptyState
          title={`No matches for “${q.trim()}”`}
          description="Try another name, code, phone, or email."
          action={
            <Button variant="outline" onClick={() => setQ("")}>
              Clear search
            </Button>
          }
        />
      ) : (
        <>
          <div className="space-y-2 sm:hidden">
            {list.map((c) => (
              <div key={c.id} className="card-surface p-3.5">
                <Link href={`/consultants/${c.id}`} className="block">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{c.name}</div>
                      <div className="mt-0.5 text-xs text-[#6b6b6b]">{c.organization}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
                      {c.mouStatus && c.mouStatus !== "None" && (
                        <Badge tone={StatusTone(c.mouStatus)}>{c.mouStatus}</Badge>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/b2b/meetings?schedule=1&consultantId=${c.id}`}
                    className="flex-1"
                  >
                    <Button size="sm" variant="outline" className="min-h-11 w-full">
                      Schedule
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="min-h-11"
                    onClick={() => sendMarketingMaterial(c.id)}
                  >
                    Materials
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto card-surface sm:block">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
                <tr>
                  <th className="px-3 py-2.5">Consultant</th>
                  <th className="px-3 py-2.5">Org</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">MOU</th>
                  <th className="px-3 py-2.5">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id} className="border-t border-[#e5e5e5] hover:bg-[#fafafa]">
                    <td className="px-3 py-2.5 font-medium">
                      <Link href={`/consultants/${c.id}`} className="hover:text-[#e31c24]">
                        {c.name}
                      </Link>
                      {c.incompleteProfile && (
                        <span className="ml-2">
                          <Badge tone="warn">Incomplete</Badge>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-[#6b6b6b]">{c.organization}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {c.mouStatus && c.mouStatus !== "None" ? (
                        <Badge tone={StatusTone(c.mouStatus)}>{c.mouStatus}</Badge>
                      ) : (
                        <span className="text-xs text-[#6b6b6b]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5">
                        <Link href={`/consultants/${c.id}`}>
                          <Button size="sm" variant="outline">
                            Open 360
                          </Button>
                        </Link>
                        <Link href={`/b2b/meetings?schedule=1&consultantId=${c.id}`}>
                          <Button size="sm" variant="ghost">
                            Schedule
                          </Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => sendMarketingMaterial(c.id)}>
                          Materials
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create consultant" wide>
        {dups.length ? (
          <div className="space-y-3">
            <p className="text-sm text-[#6b6b6b]">Possible duplicates found.</p>
            {dups.map((d) => (
              <div key={d.id} className="flex justify-between gap-2 border border-[#e5e5e5] p-3">
                <div>
                  <div className="text-sm font-semibold">{d.name}</div>
                  <div className="text-xs text-[#6b6b6b]">
                    {d.phone} · {d.email}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    requestMerge(d.id, dups[0]!.id, "Possible duplicate");
                    setDups([]);
                    setOpen(false);
                  }}
                >
                  Request merge
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const { consultant } = createConsultant({ ...form, force: true });
                setDups([]);
                setOpen(false);
                router.push(`/consultants/${consultant.id}`);
              }}
            >
              Create New
            </Button>
          </div>
        ) : (
          <ConsultantForm form={form} setForm={setForm} onSubmit={tryCreate} />
        )}
      </Modal>

      <CardxUpload open={cardx} onClose={() => setCardx(false)} mode="create" onExtracted={onCardx} />
    </div>
  );
}

function ConsultantForm({
  form,
  setForm,
  onSubmit,
}: {
  form: {
    name: string;
    organization: string;
    phone: string;
    email: string;
    region: string;
    designation: string;
  };
  setForm: (f: typeof form) => void;
  onSubmit: () => void;
}) {
  const labels: Record<keyof typeof form, string> = {
    name: "Full name",
    organization: "Organization",
    phone: "Phone",
    email: "Email",
    region: "Region",
    designation: "Designation",
  };
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(["name", "organization", "phone", "email", "designation"] as const).map((k) => (
        <div key={k}>
          <Label>
            {labels[k]}
            {k === "phone" || k === "name" ? " *" : ""}
          </Label>
          <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
        </div>
      ))}
      <div>
        <Label>Region</Label>
        <Select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}>
          {["North", "South", "East", "West", "NCR", "Maharashtra", "Karnataka"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
      </div>
      <div className="flex justify-end sm:col-span-2">
        <Button disabled={!form.name || form.phone.trim().length < 8} onClick={onSubmit}>
          Create
        </Button>
      </div>
    </div>
  );
}
