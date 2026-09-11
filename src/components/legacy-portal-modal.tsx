"use client";

import { useState } from "react";
import { Button, Modal } from "@/components/ui";
import { useSettings } from "@/lib/api/hooks";
import { buildLegacyUrl, openLegacyPortal, type LegacyAction } from "@/lib/legacy-integration";
import { ExternalLink } from "lucide-react";

export function LegacyPortalModal({
  open,
  onClose,
  action,
  consultantCode,
  consultantName,
  counsellorCode,
  parentUtmCode,
}: {
  open: boolean;
  onClose: () => void;
  action: LegacyAction;
  consultantCode: string;
  consultantName?: string;
  counsellorCode?: string;
  parentUtmCode?: string;
}) {
  const { data: settings } = useSettings();
  const base =
    action === "coupon"
      ? settings?.legacy_portal_coupon_url || "https://admin.example.com/coupon/create"
      : settings?.legacy_portal_utm_url || "https://admin.example.com/utm/create";

  const title =
    action === "coupon"
      ? "Create coupon in Admin Portal"
      : action === "child_utm"
        ? "Create child UTM in Admin Portal"
        : "Request UTM in Admin Portal";

  const href = buildLegacyUrl(base, action, {
    consultantCode,
    consultantName,
    counsellorCode,
    parentUtmCode,
  });

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-sm text-[#6b6b6b]">
        UTM and coupon creation complete in the previous Admin Portal. This portal keeps a synced
        read-only copy once the systems are connected.
      </p>
      <dl className="mt-4 space-y-2 rounded-[12px] border border-[#e5e5e5] bg-[#fafafa] p-3 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-[#6b6b6b]">Consultant</dt>
          <dd className="font-medium">{consultantName || "—"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[#6b6b6b]">Code</dt>
          <dd className="font-mono text-xs">{consultantCode}</dd>
        </div>
        {parentUtmCode && (
          <div className="flex justify-between gap-2">
            <dt className="text-[#6b6b6b]">Parent UTM</dt>
            <dd className="font-mono text-xs">{parentUtmCode}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            openLegacyPortal(href);
            onClose();
          }}
        >
          <ExternalLink className="h-4 w-4" />
          Continue in Admin Portal
        </Button>
      </div>
    </Modal>
  );
}

export function useLegacyPortal() {
  const [state, setState] = useState<{
    open: boolean;
    action: LegacyAction;
    consultantCode: string;
    consultantName?: string;
    counsellorCode?: string;
    parentUtmCode?: string;
  }>({ open: false, action: "utm", consultantCode: "" });

  return {
    ...state,
    openLegacy: (next: Omit<typeof state, "open">) => setState({ ...next, open: true }),
    closeLegacy: () => setState((s) => ({ ...s, open: false })),
  };
}
