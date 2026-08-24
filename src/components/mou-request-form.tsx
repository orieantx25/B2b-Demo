"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui";
import {
  EditableInput,
  EditableSelect,
  EditableTextarea,
  Field,
  LockedInput,
  LockedTextarea,
} from "@/components/fields";
import { cn } from "@/lib/utils";
import type { CommercialType, Consultant, StandardSlab } from "@/types";
import { Check, Upload } from "lucide-react";

const SLAB_DETAILS: Record<
  StandardSlab,
  { tier: string; terms: string; advance: string; incentive: string; payout: string }
> = {
  "Standard Slab A": {
    tier: "Tier A — Standard",
    terms: "Net 30 · Management Approved",
    advance: "₹0 (no advance)",
    incentive: "₹1,500 / valid test taker (mock)",
    payout: "Slab A payout matrix · fixed commercial · Management Approved",
  },
  "Standard Slab B": {
    tier: "Tier B — Standard",
    terms: "Net 30 · Management Approved",
    advance: "₹25,000 (mock)",
    incentive: "₹2,000 / valid test taker (mock)",
    payout: "Slab B payout matrix · fixed commercial · Management Approved",
  },
  "Standard Slab C": {
    tier: "Tier C — Standard",
    terms: "Net 45 · Management Approved",
    advance: "₹50,000 (mock)",
    incentive: "₹2,500 / valid test taker (mock)",
    payout: "Slab C payout matrix · fixed commercial · Management Approved",
  },
};

const DOC_PILLS = [
  "PAN Card",
  "GST Certificate",
  "Incorporation / ID Doc",
  "Bank Details / Cancelled Cheque",
  "Authorized Signatory ID",
] as const;

type DocPill = (typeof DOC_PILLS)[number];

export type MouFormData = {
  entityName: string;
  entityType: string;
  panNumber: string;
  panName: string;
  incorporationDoc: string;
  authorizedSignatory: string;
  email: string;
  address: string;
  termPeriod: string;
  scopeOfWork: string;
  paymentTier: string;
  paymentTerms: string;
  advanceAmount: string;
  testTakerIncentive: string;
  payoutStructure: string;
  gstRegistration: string;
  accountType: string;
  accountName: string;
  bankAccountNumber: string;
  ifscCode: string;
  commercialType: CommercialType;
  slab: StandardSlab;
};

function buildDefaults(c: Consultant): MouFormData {
  const slab: StandardSlab = "Standard Slab A";
  const d = SLAB_DETAILS[slab];
  return {
    entityName: c.organization || c.name,
    entityType: "Private Limited",
    panNumber: "AABCU" + String(1000 + (c.consultantCode.match(/\d+/)?.[0] || "1234")).slice(-4) + "F",
    panName: c.organization || c.name,
    incorporationDoc: "CIN / Partnership deed on file (demo)",
    authorizedSignatory: c.designation ? `${c.name.split(" ")[0]} (Authorized)` : c.name,
    email: c.email,
    address: `${c.region} Centre, India`,
    termPeriod: "12 months from WO signing",
    scopeOfWork:
      "Student acquisition, counselling support & uGNET test-taker facilitation for uGSOT B.Tech CS",
    paymentTier: d.tier,
    paymentTerms: d.terms,
    advanceAmount: d.advance,
    testTakerIncentive: d.incentive,
    payoutStructure: d.payout,
    gstRegistration: "Registered · 27AABCU1234F1Z5 (demo)",
    accountType: "Current",
    accountName: c.organization || c.name,
    bankAccountNumber: "502000" + (c.consultantCode.replace(/\D/g, "") + "00000000").slice(0, 8),
    ifscCode: "HDFC0001234",
    commercialType: "Standard",
    slab,
  };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-[#e5e5e5] bg-white">
      <div className="flex items-center gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5">
        <span className="h-4 w-[3px] rounded-full bg-[#e31c24]" />
        <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#111111]">{title}</h3>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function MouRequestForm({
  consultant,
  onBack,
  onSubmit,
}: {
  consultant: Consultant;
  onBack: () => void;
  onSubmit: (data: MouFormData) => void;
}) {
  const [form, setForm] = useState<MouFormData>(() => buildDefaults(consultant));
  const [docs, setDocs] = useState<Record<DocPill, boolean>>(() =>
    Object.fromEntries(DOC_PILLS.map((d) => [d, true])) as Record<DocPill, boolean>
  );

  useEffect(() => {
    setForm(buildDefaults(consultant));
  }, [consultant.id]);

  const set = <K extends keyof MouFormData>(key: K, value: MouFormData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const standardLocked = form.commercialType === "Standard";
  const slabInfo = useMemo(() => SLAB_DETAILS[form.slab], [form.slab]);

  useEffect(() => {
    if (form.commercialType !== "Standard") return;
    const d = SLAB_DETAILS[form.slab];
    setForm((f) => ({
      ...f,
      paymentTier: d.tier,
      paymentTerms: d.terms,
      advanceAmount: d.advance,
      testTakerIncentive: d.incentive,
      payoutStructure: d.payout,
    }));
  }, [form.slab, form.commercialType]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-[11px]">
        <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-white px-2.5 py-1 text-[#6b6b6b]">
          <span className="h-2 w-2 rounded-sm border border-[#e5e5e5] bg-white" /> Editable
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-[#e5e5e5] bg-[#fafafa] px-2.5 py-1 text-[#6b6b6b]">
          <span className="h-2 w-2 rounded-sm bg-[#e5e5e5]" /> Locked / system
        </span>
      </div>
      <p className="text-xs text-[#6b6b6b]">
        Pre-filled from consultant master + meeting. White fields are editable. Grey locked fields are
        Management Approved (Standard) or system-synced.
      </p>

      <Section title="Entity information">
        <Field label="Registered Name of the Company / Individual (Entity)" full>
          <EditableInput value={form.entityName} onChange={(e) => set("entityName", e.target.value)} />
        </Field>
        <Field label="Type of Entity">
          <EditableSelect value={form.entityType} onChange={(e) => set("entityType", e.target.value)}>
            <option>Private Limited</option>
            <option>Partnership</option>
            <option>Proprietorship</option>
            <option>Individual</option>
            <option>LLP</option>
            <option>Trust / Society</option>
          </EditableSelect>
        </Field>
        <Field label="PAN Card (Entity / Individual)">
          <EditableInput value={form.panNumber} onChange={(e) => set("panNumber", e.target.value)} />
        </Field>
        <Field label="PAN Card Name">
          <EditableInput value={form.panName} onChange={(e) => set("panName", e.target.value)} />
        </Field>
        <Field label="Incorporation / Identification Document">
          <EditableInput
            value={form.incorporationDoc}
            onChange={(e) => set("incorporationDoc", e.target.value)}
          />
        </Field>
        <Field label="Name of Authorized Signatory">
          <EditableInput
            value={form.authorizedSignatory}
            onChange={(e) => set("authorizedSignatory", e.target.value)}
          />
        </Field>
        <Field label="Email ID">
          <EditableInput
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field label="Address" full>
          <EditableTextarea value={form.address} onChange={(e) => set("address", e.target.value)} />
        </Field>
      </Section>

      <Section title="Contract terms">
        <Field label="Commercial structure" full>
          <EditableSelect
            value={form.commercialType}
            onChange={(e) => set("commercialType", e.target.value as CommercialType)}
          >
            <option value="Standard">Standard (Management Approved slabs)</option>
            <option value="Non-Standard">Non-Standard (existing approval process)</option>
          </EditableSelect>
        </Field>
        <Field label="Type of Payment (Tier) / Slab" hint={standardLocked ? `Management Approved · ${slabInfo.tier}` : undefined}>
          <EditableSelect value={form.slab} onChange={(e) => set("slab", e.target.value as StandardSlab)}>
            <option>Standard Slab A</option>
            <option>Standard Slab B</option>
            <option>Standard Slab C</option>
          </EditableSelect>
        </Field>
        <Field label="Term Period">
          <EditableInput value={form.termPeriod} onChange={(e) => set("termPeriod", e.target.value)} />
        </Field>
        <Field label="Scope of Work" full>
          <EditableTextarea value={form.scopeOfWork} onChange={(e) => set("scopeOfWork", e.target.value)} />
        </Field>
        {standardLocked ? (
          <>
            <LockedInput label="Terms of Payment" value={form.paymentTerms} />
            <LockedInput label="Advance Amount (if applicable)" value={form.advanceAmount} />
            <LockedInput
              label="Test Taker Incentive Amount (Per valid Test Taker)"
              value={form.testTakerIncentive}
              full
            />
          </>
        ) : (
          <>
            <Field label="Terms of Payment">
              <EditableInput
                value={form.paymentTerms}
                onChange={(e) => set("paymentTerms", e.target.value)}
              />
            </Field>
            <Field label="Advance Amount (if applicable)">
              <EditableInput
                value={form.advanceAmount}
                onChange={(e) => set("advanceAmount", e.target.value)}
              />
            </Field>
            <Field label="Test Taker Incentive Amount (Per valid Test Taker)" full>
              <EditableInput
                value={form.testTakerIncentive}
                onChange={(e) => set("testTakerIncentive", e.target.value)}
              />
            </Field>
          </>
        )}
      </Section>

      <Section title="Payout structure">
        {standardLocked ? (
          <LockedTextarea
            label="Selected slab (view only · Standard)"
            value={form.payoutStructure}
            full
            hint="Standard slabs are Management Approved and not editable. Switch to Non-Standard to customize."
          />
        ) : (
          <Field label="Payout structure (editable · Non-Standard)" full>
            <EditableTextarea
              value={form.payoutStructure}
              onChange={(e) => set("payoutStructure", e.target.value)}
            />
          </Field>
        )}
      </Section>

      <Section title="GST & bank details">
        <Field label="GST Registration">
          <EditableInput
            value={form.gstRegistration}
            onChange={(e) => set("gstRegistration", e.target.value)}
          />
        </Field>
        <Field label="Account Type">
          <EditableSelect value={form.accountType} onChange={(e) => set("accountType", e.target.value)}>
            <option>Current</option>
            <option>Savings</option>
            <option>Overdraft</option>
          </EditableSelect>
        </Field>
        <Field label="Account Name (Bank)">
          <EditableInput value={form.accountName} onChange={(e) => set("accountName", e.target.value)} />
        </Field>
        <Field label="Bank Account Number">
          <EditableInput
            value={form.bankAccountNumber}
            onChange={(e) => set("bankAccountNumber", e.target.value)}
          />
        </Field>
        <Field label="IFSC Code" full>
          <EditableInput value={form.ifscCode} onChange={(e) => set("ifscCode", e.target.value)} />
        </Field>
      </Section>

      <section className="rounded-[14px] border border-[#e5e5e5] bg-white">
        <div className="flex items-center gap-2 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-2.5">
          <span className="h-4 w-[3px] rounded-full bg-[#e31c24]" />
          <h3 className="text-[0.72rem] font-bold uppercase tracking-[0.06em] text-[#111111]">
            Supporting documents
          </h3>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-xs text-[#6b6b6b]">Demo — tap a pill to mark uploaded. No real file transfer.</p>
          <div className="flex flex-wrap gap-2">
            {DOC_PILLS.map((d) => {
              const on = docs[d];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDocs((prev) => ({ ...prev, [d]: !prev[d] }))}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                    on
                      ? "border-[#b7dfc9] bg-[#e8f5ef] text-[#1b7a4e]"
                      : "border-[#e5e5e5] bg-white text-[#6b6b6b] hover:border-[#ccc]"
                  )}
                >
                  {on ? <Check className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                  {on ? `${d} · Uploaded` : `Upload ${d}`}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-[#e5e5e5] bg-white pt-3 pb-1">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={() => onSubmit(form)}
          disabled={!form.entityName || !form.email || !form.panNumber}
        >
          Submit MOU request
        </Button>
      </div>
    </div>
  );
}
