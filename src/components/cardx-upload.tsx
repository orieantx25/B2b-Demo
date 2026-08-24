"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Button, Modal } from "@/components/ui";
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
      // demo path without a real file
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
    <Modal open={open} onClose={handleClose} title="CardX / OCR — Visiting card">
      <p className="mb-3 text-xs text-[#6b6b6b]">
        Simulates CardX. OCR assists — does not approve. Operations verifies.
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
              {busy ? "Processing with CardX…" : preview ? "Processing…" : "Tap to capture or upload"}
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
          <Button variant="outline" className="w-full" disabled={busy} onClick={() => processFile(null)}>
            <ScanLine className="h-4 w-4" />
            Use demo card image
          </Button>
        </div>
      ) : (
        <div className="space-y-2 text-sm">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Scanned card"
              className="mb-2 max-h-28 w-full rounded-lg object-contain bg-[#f6f6f6]"
            />
          )}
          <div>
            Name: <strong>{extracted.name}</strong>
          </div>
          <div>Phone: {extracted.phone}</div>
          <div>Email: {extracted.email}</div>
          <div>Organization: {extracted.organization}</div>
          <div>Designation: {extracted.designation}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={confirm}>
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
        <span className="text-[11px] text-[#6b6b6b]">CardX visiting card</span>
      </span>
    </button>
  );
}
