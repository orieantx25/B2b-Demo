"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Button, Input, Label, Modal } from "@/components/ui";
import { IdCard, Loader2, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type CardxExtract = {
  name: string;
  phone: string;
  email: string;
  organization: string;
  designation: string;
};

type Mode = "create" | "attach";

export function CardxUpload({
  open,
  onClose,
  mode = "create",
  consultantId,
  onExtracted,
}: {
  open: boolean;
  onClose: () => void;
  mode?: Mode;
  consultantId?: string;
  onExtracted?: (data: CardxExtract) => void;
}) {
  const applyCardxExtract = useAppStore((s) => s.applyCardxExtract);
  const uploadDocument = useAppStore((s) => s.uploadDocument);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [extracted, setExtracted] = useState<CardxExtract | null>(null);

  const reset = () => {
    setBusy(false);
    setPreview(null);
    setExtracted(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const processFile = (file: File | null) => {
    if (!file) {
      setBusy(true);
      setTimeout(() => {
        const data: CardxExtract = {
          name: "Vikram Malhotra",
          phone: "9876543210",
          email: "vikram@careerpoint.edu.in",
          organization: "Career Point Demo",
          designation: "Centre Head",
        };
        applyCardxExtract(data);
        setExtracted(data);
        setBusy(false);
      }, 900);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    setTimeout(() => {
      const data: CardxExtract = {
        name: "Vikram Malhotra",
        phone: "9876543210",
        email: "vikram@careerpoint.edu.in",
        organization: "Career Point Demo",
        designation: "Centre Head",
      };
      applyCardxExtract(data);
      setExtracted(data);
      setBusy(false);
    }, 900);
  };

  const confirm = () => {
    if (!extracted) return;
    if (extracted.phone.trim().length < 8 && mode === "create") return;
    if (mode === "attach" && consultantId) {
      uploadDocument(consultantId, "Visiting Card");
      onExtracted?.(extracted);
      handleClose();
      return;
    }
    onExtracted?.(extracted);
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Scan card">
      <p className="mb-3 text-xs text-[#6b6b6b]">
        OCR assists capture — Operations still verifies. Does not approve. Edit fields before confirming.
      </p>
      {!extracted ? (
        <div className="space-y-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-[#e5e5e5] bg-[#fafafa] px-4 py-10 text-center transition hover:border-[#e31c24]/40 hover:bg-[#fdecec]/30",
              busy && "opacity-70"
            )}
          >
            {busy ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#e31c24]" />
            ) : preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Card preview" className="max-h-32 rounded-lg object-contain" />
            ) : (
              <IdCard className="h-8 w-8 text-[#e31c24]" />
            )}
            <div className="text-sm font-semibold text-[#111111]">
              {busy ? "Scanning…" : preview ? "Processing…" : "Tap to capture or upload"}
            </div>
            <div className="text-xs text-[#6b6b6b]">Camera or gallery · image only</div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => processFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => processFile(null)}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-[#6b6b6b] underline-offset-2 hover:text-[#111111] hover:underline disabled:opacity-50"
          >
            <ScanLine className="h-3.5 w-3.5" />
            Use demo card
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Scanned card"
              className="mb-1 max-h-28 w-full rounded-lg object-contain bg-[#f6f6f6]"
            />
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="cardx-name">Full name *</Label>
              <Input
                id="cardx-name"
                value={extracted.name}
                onChange={(e) => setExtracted({ ...extracted, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cardx-phone">Phone *</Label>
              <Input
                id="cardx-phone"
                value={extracted.phone}
                onChange={(e) => setExtracted({ ...extracted, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cardx-email">Email</Label>
              <Input
                id="cardx-email"
                value={extracted.email}
                onChange={(e) => setExtracted({ ...extracted, email: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cardx-org">Organization</Label>
              <Input
                id="cardx-org"
                value={extracted.organization}
                onChange={(e) => setExtracted({ ...extracted, organization: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cardx-desig">Designation</Label>
              <Input
                id="cardx-desig"
                value={extracted.designation}
                onChange={(e) => setExtracted({ ...extracted, designation: e.target.value })}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={!extracted.name.trim() || (mode === "create" && extracted.phone.trim().length < 8)}
              onClick={confirm}
            >
              {mode === "attach" ? "Attach to consultant" : "Confirm & continue"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setExtracted(null);
                setPreview(null);
              }}
            >
              Re-scan
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

export function CardxActionTile({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex min-h-[5.5rem] flex-col items-start justify-between rounded-[16px] border border-[#e5e5e5] bg-white p-3.5 text-left shadow-[0_1px_2px_rgba(17,17,17,0.04)] transition duration-150 hover:border-[#e31c24]/35 active:scale-[0.98]",
        className
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fdecec] text-[#e31c24]">
        <IdCard className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#111111]">Scan card</span>
        <span className="text-[11px] text-[#6b6b6b]">Visiting card</span>
      </span>
    </button>
  );
}
