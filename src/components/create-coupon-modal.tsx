"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/components/auth-provider";
import { Button, Input, Label, Modal, Select } from "@/components/ui";
import { buildLegacyUrl, openLegacyPortal } from "@/lib/legacy-integration";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    purpose: z.string().min(2, "Purpose is required"),
    couponName: z.string().min(2, "Coupon name is required"),
    code: z
      .string()
      .min(3, "Code is required")
      .regex(/^[A-Z0-9_-]+$/, "Use uppercase letters, numbers, _ or -"),
    discountAmount: z.string().min(1, "Discount amount is required"),
    validityStart: z.string().min(1, "Start date required"),
    validityEnd: z.string().min(1, "End date required"),
    status: z.enum(["Active", "Inactive", "Draft"]),
    consultantId: z.string().min(1, "Consultant is required"),
  })
  .refine((v) => v.validityEnd >= v.validityStart, {
    message: "End date must be on or after start",
    path: ["validityEnd"],
  });

type Props = {
  open: boolean;
  onClose: () => void;
  /** Prefill when opened from consultant 360 */
  consultantId?: string;
};

export function CreateCouponModal({ open, onClose, consultantId: prefillId }: Props) {
  const { user } = useAuth();
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const currentUserId = useAppStore((s) => s.currentUserId);
  const persona = useAppStore((s) => s.persona);
  const createCoupon = useAppStore((s) => s.createCoupon);
  const addToast = useAppStore((s) => s.addToast);

  const [search, setSearch] = useState("");
  const [adminIds, setAdminIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    purpose: "",
    couponName: "",
    code: "",
    discountAmount: "",
    validityStart: new Date().toISOString().slice(0, 10),
    validityEnd: "",
    status: "Active" as "Active" | "Inactive" | "Draft",
    consultantId: prefillId || "",
  });

  useEffect(() => {
    if (open && prefillId) {
      setForm((f) => ({ ...f, consultantId: prefillId }));
    }
  }, [open, prefillId]);

  const myConsultants = useMemo(() => {
    const rows =
      persona === "b2b" ? consultants.filter((c) => c.ownerId === currentUserId) : consultants;
    return [...rows].sort((a, b) => a.name.localeCompare(b.name));
  }, [consultants, persona, currentUserId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = form.consultantId
      ? myConsultants
      : myConsultants;
    if (!q) return base.slice(0, 40);
    return base
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.organization.toLowerCase().includes(q) ||
          c.consultantCode.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [myConsultants, search, form.consultantId]);

  const selected = myConsultants.find((c) => c.id === form.consultantId);
  const admins = useMemo(
    () => members.filter((m) => m.role === "Admin" || m.role === "Leadership" || m.role === "Operations"),
    [members]
  );

  const createdBy = user?.name || members.find((m) => m.id === currentUserId)?.name || "You";

  const reset = () => {
    setForm({
      purpose: "",
      couponName: "",
      code: "",
      discountAmount: "",
      validityStart: new Date().toISOString().slice(0, 10),
      validityEnd: "",
      status: "Active",
      consultantId: prefillId || "",
    });
    setSearch("");
    setAdminIds([]);
    setErrors({});
  };

  const submit = () => {
    const parsed = schema.safeParse({
      ...form,
      code: form.code.toUpperCase(),
    });
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

    createCoupon(c.id, data.code);
    addToast({
      title: "Coupon submitted",
      description: `${data.code} · ${c.name} · handoff to Admin Portal`,
      variant: "success",
    });

    const url = buildLegacyUrl("https://admin.example.com/coupon/create", "coupon", {
      consultantCode: c.consultantCode,
      consultantName: c.name,
      fields: {
        purpose: data.purpose,
        couponName: data.couponName,
        code: data.code,
        discountAmount: data.discountAmount,
        validityStart: data.validityStart,
        validityEnd: data.validityEnd,
        status: data.status,
        createdBy,
        notifyAdmins: adminIds.join(","),
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
      title="Create Coupon"
      xl
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Created by</Label>
          <Input value={createdBy} readOnly className="bg-[#f6f6f6]" />
        </div>
        <div>
          <Label htmlFor="coupon-purpose">Purpose / context *</Label>
          <Input
            id="coupon-purpose"
            value={form.purpose}
            onChange={(e) => setForm({ ...form, purpose: e.target.value })}
            placeholder="e.g. Partner launch offer"
          />
          {errors.purpose && <p className="mt-1 text-xs text-[#e31c24]">{errors.purpose}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label>Admins to notify</Label>
          <div className="mt-1 max-h-28 overflow-y-auto rounded-xl border border-[#e5e5e5] p-2">
            {admins.length === 0 ? (
              <p className="px-1 py-2 text-xs text-[#6b6b6b]">No admin profiles loaded</p>
            ) : (
              admins.map((a) => {
                const checked = adminIds.includes(a.id);
                return (
                  <label key={a.id} className="flex min-h-10 cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setAdminIds((prev) =>
                          checked ? prev.filter((id) => id !== a.id) : [...prev, a.id]
                        )
                      }
                    />
                    {a.name} <span className="text-xs text-[#6b6b6b]">({a.role})</span>
                  </label>
                );
              })
            )}
          </div>
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Stub: loads Admin / Leadership / Operations</p>
        </div>

        <div>
          <Label htmlFor="coupon-name">Coupon name *</Label>
          <Input
            id="coupon-name"
            value={form.couponName}
            onChange={(e) => setForm({ ...form, couponName: e.target.value })}
          />
          {errors.couponName && <p className="mt-1 text-xs text-[#e31c24]">{errors.couponName}</p>}
        </div>
        <div>
          <Label htmlFor="coupon-code">Code *</Label>
          <Input
            id="coupon-code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            placeholder="PARTNER500"
            className="font-mono uppercase"
          />
          {errors.code && <p className="mt-1 text-xs text-[#e31c24]">{errors.code}</p>}
        </div>
        <div>
          <Label htmlFor="coupon-discount">Discount amount (₹) *</Label>
          <Input
            id="coupon-discount"
            inputMode="decimal"
            value={form.discountAmount}
            onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
            placeholder="500"
          />
          <p className="mt-1 text-[11px] text-[#6b6b6b]">Amount in INR; percentage coupons via Admin Portal</p>
          {errors.discountAmount && (
            <p className="mt-1 text-xs text-[#e31c24]">{errors.discountAmount}</p>
          )}
        </div>
        <div>
          <Label>Status *</Label>
          <Select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as "Active" | "Inactive" | "Draft" })
            }
          >
            <option>Active</option>
            <option>Inactive</option>
            <option>Draft</option>
          </Select>
        </div>
        <div>
          <Label>Validity start *</Label>
          <Input
            type="date"
            value={form.validityStart}
            onChange={(e) => setForm({ ...form, validityStart: e.target.value })}
          />
          {errors.validityStart && (
            <p className="mt-1 text-xs text-[#e31c24]">{errors.validityStart}</p>
          )}
        </div>
        <div>
          <Label>Validity end *</Label>
          <Input
            type="date"
            value={form.validityEnd}
            onChange={(e) => setForm({ ...form, validityEnd: e.target.value })}
          />
          {errors.validityEnd && (
            <p className="mt-1 text-xs text-[#e31c24]">{errors.validityEnd}</p>
          )}
        </div>

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
            <div className="max-h-40 overflow-y-auto rounded-xl border border-[#e5e5e5]">
              {filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setForm({ ...form, consultantId: c.id })}
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
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            reset();
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button onClick={submit}>Create coupon</Button>
      </div>
    </Modal>
  );
}
