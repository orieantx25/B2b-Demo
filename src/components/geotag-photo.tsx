"use client";

import { useRef, useState } from "react";
import { Button, Label } from "@/components/ui";
import { captureGeo, formatGeo, readImageAsDataUrl, type GeoTag } from "@/lib/geo";
import { Camera, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function GeotagPhotoField({
  photoUrl,
  geo,
  onChange,
  compact,
}: {
  photoUrl?: string;
  geo?: GeoTag;
  onChange: (next: { photoUrl: string; geo: GeoTag } | null) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file: File | null) => {
    if (!file) return;
    setBusy(true);
    try {
      const dataUrl = await readImageAsDataUrl(file);
      const { geo: g, demo } = await captureGeo();
      if (demo) g.label = g.label || "NCR (demo)";
      onChange({ photoUrl: dataUrl, geo: g });
    } finally {
      setBusy(false);
    }
  };

  const useDemo = async () => {
    setBusy(true);
    try {
      const { geo: g } = await captureGeo();
      let dataUrl = "";
      if (typeof document !== "undefined") {
        const c = document.createElement("canvas");
        c.width = 640;
        c.height = 360;
        const ctx = c.getContext("2d")!;
        ctx.fillStyle = "#1a1a1a";
        ctx.fillRect(0, 0, 640, 360);
        ctx.fillStyle = "#e31c24";
        ctx.fillRect(0, 300, 640, 60);
        ctx.fillStyle = "#fff";
        ctx.font = "20px sans-serif";
        ctx.fillText("Demo meeting photo", 24, 330);
        ctx.fillStyle = "#aaa";
        ctx.font = "14px sans-serif";
        ctx.fillText("Geotagged for uGSOT field demo", 24, 48);
        dataUrl = c.toDataURL("image/jpeg", 0.85);
      }
      onChange({ photoUrl: dataUrl, geo: { ...g, label: g.label || "NCR (demo)" } });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {!compact && <Label>Geotag photo</Label>}
      {photoUrl && geo ? (
        <div className="relative overflow-hidden rounded-[12px] border border-[#e5e5e5] bg-[#111111]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photoUrl} alt="Meeting geotag" className="h-36 w-full object-cover sm:h-44" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 py-2.5 text-white">
            <div className="flex min-w-0 items-center gap-1.5 text-[11px]">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#e31c24]" />
              <span className="truncate">{formatGeo(geo)}</span>
            </div>
            <button
              type="button"
              className="rounded-full bg-white/15 p-1 hover:bg-white/25"
              aria-label="Remove photo"
              onClick={() => onChange(null)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Camera className="h-4 w-4" />
            {busy ? "Capturing…" : "Add geotag photo"}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={useDemo}>
            Use demo photo
          </Button>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] || null)}
      />
    </div>
  );
}

export function MeetingPhotoChip({
  photoUrl,
  geo,
}: {
  photoUrl?: string;
  geo?: GeoTag;
}) {
  if (!photoUrl) return null;
  return (
    <div className="mt-2 flex items-center gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoUrl} alt="" className="h-10 w-14 rounded-md object-cover border border-[#e5e5e5]" />
      {geo && (
        <span className="flex items-center gap-1 text-[10px] text-[#6b6b6b]">
          <MapPin className="h-3 w-3 text-[#e31c24]" />
          {formatGeo(geo)}
        </span>
      )}
    </div>
  );
}
