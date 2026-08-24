"use client";

import { Badge } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { cn, formatDateTime } from "@/lib/utils";
import type { Consultant, MouRequest, MouStatus, UtmRecord } from "@/types";

const STEPS = [
  "FIRST MEETING",
  "MOU REQUESTED",
  "VERIFIED",
  "WO GENERATED",
  "WO SENT",
  "SIGNED",
  "UTM CREATED",
  "FIRST LEAD",
  "ACTIVE",
] as const;

function stepIndex(c: Consultant, mouStatus: MouStatus | "None"): number {
  if (c.status === "Active") return 8;
  if (c.firstLeadId || c.firstLeadDate) return 7;
  if (c.utmStatus !== "None") return 6;
  if (mouStatus === "Signed") return 5;
  if (["Awaiting Signature", "WO Sent"].includes(mouStatus)) return 4;
  if (mouStatus === "WO Generated") return 3;
  if (["Approved", "Verification", "Legal Review", "Finance Approval"].includes(mouStatus)) return 2;
  if (["Requested", "Rework"].includes(mouStatus)) return 1;
  if (c.firstMeetingId || c.firstMeetingDate) return 0;
  return -1;
}

/** When each journey stage was reached (undefined = not reached yet). */
function stageTimestamps(
  c: Consultant,
  mou: MouRequest | undefined,
  utms: UtmRecord[]
): (string | undefined)[] {
  const utmAt = utms.length
    ? [...utms].sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]?.createdAt
    : undefined;

  const verifiedAt =
    mou?.verifiedAt ||
    mou?.approvedAt ||
    (mou &&
    ["Approved", "WO Generated", "WO Sent", "Awaiting Signature", "Signed", "Verification"].includes(
      mou.status
    )
      ? mou.updatedAt
      : undefined);

  const activeAt =
    c.status === "Active" ? c.firstLeadDate || c.updatedAt || c.createdAt : undefined;

  return [
    c.firstMeetingDate || c.createdAt,
    mou?.createdAt,
    verifiedAt,
    mou?.woGeneratedAt,
    mou?.woSentAt,
    mou?.signedAt,
    utmAt,
    c.firstLeadDate,
    activeAt,
  ];
}

export function ConsultantJourney({ consultant }: { consultant: Consultant }) {
  const mous = useAppStore((s) => s.mous);
  const utms = useAppStore((s) => s.utms);
  const mou = mous
    .filter((m) => m.consultantId === consultant.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const cUtms = utms.filter((u) => u.consultantId === consultant.id);
  const current = stepIndex(consultant, consultant.mouStatus);
  const times = stageTimestamps(consultant, mou, cUtms);

  return (
    <div className="card-surface p-4">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="section-title text-[0.95rem]">Consultant Journey</h3>
        <Badge tone={consultant.status === "Active" ? "success" : "warn"}>{consultant.status}</Badge>
      </div>
      <div className="relative space-y-0">
        {STEPS.map((step, i) => {
          const done = i <= current;
          const active = i === current;
          const at = done ? times[i] : undefined;
          return (
            <div key={step} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold transition duration-200",
                    done ? "bg-[#e31c24] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]",
                    active && "ring-2 ring-[#e31c24]/30 ring-offset-2"
                  )}
                >
                  {i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[22px] rounded-full",
                      i < current ? "bg-[#e31c24]" : "bg-[#e5e5e5]"
                    )}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 pb-3.5 pt-0.5">
                <div
                  className={cn(
                    "text-[11px] font-semibold tracking-wide",
                    done ? "text-[#111111]" : "text-[#6b6b6b]"
                  )}
                >
                  {step}
                </div>
                {at ? (
                  <time
                    dateTime={at}
                    className="mt-0.5 block text-[10px] tabular-nums text-[#6b6b6b]"
                  >
                    {formatDateTime(at)}
                  </time>
                ) : (
                  <div className="mt-0.5 text-[10px] text-[#b0b0b0]">
                    {done ? "—" : "Not reached"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[#6b6b6b]">
        MOU signed ≠ Active. First associated lead activates the consultant.
      </p>
    </div>
  );
}

export function MouLifecycle({ status }: { status: MouStatus }) {
  const steps: MouStatus[] = [
    "Requested",
    "Verification",
    "Approved",
    "WO Generated",
    "WO Sent",
    "Awaiting Signature",
    "Signed",
  ];
  const idx = steps.indexOf(status === "Rework" ? "Verification" : status);
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold",
              i <= idx ? "bg-[#e31c24] text-white" : "bg-[#f0f0f0] text-[#6b6b6b]",
              status === "Rework" &&
                s === "Verification" &&
                "border border-[#f0d2ad] bg-[#fff4e8] text-[#b45309]"
            )}
          >
            {s === "Awaiting Signature" ? "AWAITING SIG" : s.toUpperCase()}
          </span>
          {i < steps.length - 1 && <span className="text-xs text-[#e5e5e5]">→</span>}
        </div>
      ))}
    </div>
  );
}
