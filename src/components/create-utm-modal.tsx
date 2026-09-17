"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button, Input, Label, Modal } from "@/components/ui";
import { buildLegacyUrl, openLegacyPortal } from "@/lib/legacy-integration";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const schema = z.object({
  landingPage: z.string().min(1, "Landing page required"),
  path: z.string().min(1, "Path required"),
  medium: z.string().min(1, "UTM medium required"),
  source: z.string().min(1, "UTM source required"),
  campaign: z.string().min(1, "UTM campaign required"),
  content: z.string().optional(),
  couponCode: z.string().optional(),
  consultantId: z.string().min(1, "Consultant is required"),
});

function shortHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 8);
}

type Props = {
  open: boolean;
  onClose: () => void;
  consultantId?: string;
};

export function CreateUtmModal({ open, onClose, consultantId: prefillId }: Props) {
  const consultants = useAppStore((s) => s.consultants);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);
  const requestUtm = useAppStore((s) => s.requestUtm);
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [refreshCount, setRefreshCount] = useState(0);
  const [form, setForm] = useState({
    landingPage: "https://ugsot.edu/apply",
    path: "/apply",
    medium: "partner",
    source: "consultant",
    campaign: "",
    content: "",
    couponCode: "",
    consultantId: prefillId || "",
  });

  const myConsultants = useMemo(() => {
    const rows =
      persona === "b2b" ? consultants.filter((c) => c.ownerId === currentUserId) : consultants;
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [consultants, persona, currentUserId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return myConsultants.slice(0, 40);
    return myConsultants
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.consultantCode.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [myConsultants, search]);

  const selected = myConsultants.find((c) => c.id === form.consultantId);

  useEffect(() => {
    if (prefillId && open) {
      const c = consultants.find((x) => x.id === prefillId);
      if (c) {
        setForm((f) => ({
          ...f,
          consultantId: c.id,
          campaign: f.campaign || c.name.replace(/\s+/g, "_").toLowerCase(),
        }));
      }
    }
  }, [prefillId, open, consultants]);

  const fullUrl = useMemo(() => {
    try {
      const u = new URL(form.landingPage);
      if (form.path && !form.path.startsWith("http")) {
        u.pathname = form.path.startsWith("/") ? form.path : `/${form.path}`;
      }
      u.searchParams.set("utm_medium", form.medium);
      u.searchParams.set("utm_source", form.source);
      u.searchParams.set("utm_campaign", form.campaign);
      if (form.content) u.searchParams.set("utm_content", form.content);
      if (form.couponCode) u.searchParams.set("coupon", form.couponCode);
      if (selected) u.searchParams.set("consultant", selected.consultantCode);
      return u.toString();
    } catch {
      return "";
    }
  }, [form, selected]);

  const shortUrl = useMemo(() => {
    if (!fullUrl) return "https://s.ugsot.app/…";
    return `https://s.ugsot.app/${shortHash(fullUrl)}`;
  }, [fullUrl]);

  const reset = () => {
    setForm({
      landingPage: "https://ugsot.edu/apply",
      path: "/apply",
      medium: "partner",
      source: "consultant",
      campaign: "",
      content: "",
      couponCode: "",
      consultantId: prefillId || "",
    });
    setSearch("");
    setErrors({});
  };

  const pickConsultant = (id: string) => {
    const c = myConsultants.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      consultantId: id,
      campaign: c ? c.name.replace(/\s+/g, "_").toLowerCase() : f.campaign,
    }));
  };

  const copyShort = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      addToast({ title: "Short URL copied", variant: "success" });
    } catch {
      addToast({ title: "Could not copy", variant: "error" });
    }
  };

  const submit = () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] || "form");
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const data = parsed.data;
    const c = consultants.find((x) => x.id === data.consultantId);
    if (!c) return;

    requestUtm(c.id);
    addToast({
      title: "UTM link created",
      description: `${shortUrl} · synced stub`,
      variant: "success",
    });

    const url = buildLegacyUrl("https://admin.example.com/utm/create", "utm", {
      consultantCode: c.consultantCode,
      consultantName: c.name,
      counsellorCode: c.existingUtmCode,
      fields: {
        landingPage: data.landingPage,
        path: data.path,
        utm_medium: data.medium,
        utm_source: data.source,
        utm_campaign: data.campaign,
        utm_content: data.content || "",
        coupon: data.couponCode || "",
        shortUrl,
        fullUrl,
      },
    });
    openLegacyPortal(url);
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title="Create UTM / Tracking link"
      xl
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Consultant *</Label>
            {!prefillId && (
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your consultants…"
                className="mb-2"
              />
            )}
            {selected && prefillId ? (
              <div className="rounded-xl border border-[#e5e5e5] bg-[#f6f6f6] px-3 py-2.5 text-sm">
                <span className="font-semibold">{selected.name}</span>
                <span className="text-[#6b6b6b]"> · {selected.consultantCode}</span>
              </div>
            ) : (
              <div className="max-h-36 overflow-y-auto rounded-xl border border-[#e5e5e5]">
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickConsultant(c.id)}
                    className={cn(
                      "flex w-full flex-col border-b border-[#e5e5e5] px-3 py-2.5 text-left text-sm last:border-0 hover:bg-[#fafafa]",
                      form.consultantId === c.id && "bg-[#fdecec]"
                    )}
                  >
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-xs text-[#6b6b6b]">
                      {c.organization} · {c.consultantCode}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {errors.consultantId && (
              <p className="mt-1 text-xs text-[#e31c24]">{errors.consultantId}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label>Landing page *</Label>
            <Input
              value={form.landingPage}
              onChange={(e) => setForm({ ...form, landingPage: e.target.value })}
            />
            {errors.landingPage && (
              <p className="mt-1 text-xs text-[#e31c24]">{errors.landingPage}</p>
            )}
          </div>
          <div>
            <Label>Path *</Label>
            <Input
              value={form.path}
              onChange={(e) => setForm({ ...form, path: e.target.value })}
              placeholder="/apply"
            />
            {errors.path && <p className="mt-1 text-xs text-[#e31c24]">{errors.path}</p>}
          </div>
          <div>
            <Label>UTM medium *</Label>
            <Input
              value={form.medium}
              onChange={(e) => setForm({ ...form, medium: e.target.value })}
            />
            {errors.medium && <p className="mt-1 text-xs text-[#e31c24]">{errors.medium}</p>}
          </div>
          <div>
            <Label>UTM source *</Label>
            <Input
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            {errors.source && <p className="mt-1 text-xs text-[#e31c24]">{errors.source}</p>}
          </div>
          <div>
            <Label>UTM campaign *</Label>
            <Input
              value={form.campaign}
              onChange={(e) => setForm({ ...form, campaign: e.target.value })}
            />
            {errors.campaign && <p className="mt-1 text-xs text-[#e31c24]">{errors.campaign}</p>}
          </div>
          <div>
            <Label>UTM content</Label>
            <Input
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
            <div className="min-w-[160px] flex-1">
              <Label>Coupon code</Label>
              <Input
                value={form.couponCode}
                onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                placeholder="Optional"
                className="font-mono uppercase"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() =>
                addToast({
                  title: form.couponCode ? `Applied ${form.couponCode}` : "Enter a coupon first",
                  variant: form.couponCode ? "success" : "error",
                })
              }
            >
              Apply
            </Button>
          </div>
        </div>

        <aside className="rounded-xl border border-[#e5e5e5] bg-[#f6f6f6] p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-[#6b6b6b]">Short URL</div>
          <p className="mt-2 break-all font-mono text-sm font-semibold text-[#111]">{shortUrl}</p>
          <div className="mt-3 flex flex-col gap-2">
            <Button size="sm" variant="outline" onClick={copyShort}>
              Copy short URL
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setRefreshCount((n) => n + 1);
                addToast({
                  title: "Counts refreshed",
                  description: `Stub refresh #${refreshCount + 1}`,
                  variant: "success",
                });
              }}
            >
              Refresh counts ({refreshCount})
            </Button>
          </div>
          {fullUrl && (
            <p className="mt-3 break-all text-[10px] leading-relaxed text-[#6b6b6b]">{fullUrl}</p>
          )}
        </aside>
      </div>

      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button onClick={submit}>Create Normal Link</Button>
      </div>
    </Modal>
  );
}
