"use client";

import { Badge } from "@/components/ui";
import { useAppStore } from "@/store/app-store";
import { cn, formatDateTime } from "@/lib/utils";
import type { Consultant, MouRequest, MouStatus, UtmRecord } from "@/types";

const STEPS = [
  "FIRST MEETING",
  "MOU REQUESTED",
  "VERIFIED",
  "SENT TO LEGAL",
  "FINANCE APPROVED",
  "DRAFT SHARED",
  "SENT TO CLIENT",
  "SIGNED",
  "MATERIALS SHARED",
  "UTM CREATED",
  "FIRST LEAD",
  "ACTIVE",
] as const;

function stepIndex(c: Consultant, mou: MouRequest | undefined, mouStatus: MouStatus | "None"): number {
  if (c.status === "Active") return 11;
  if (c.firstLeadId || c.firstLeadDate) return 10;
  if (c.utmStatus !== "None") return 9;
  if (mouStatus === "Signed" && c.materialsSharedAt) return 8;
  if (mouStatus === "Signed" || mou?.signedAt) return 7;
  if (mou?.opsTrack?.sentToClientAt || mou?.woSentAt || ["Awaiting Signature", "WO Sent"].includes(mouStatus))
    return 6;
  if (mou?.opsTrack?.draftSharedAt) return 5;
  if (mou?.opsTrack?.financeApprovedAt || mouStatus === "WO Generated" || mouStatus === "Finance Approval")
    return 4;
  if (mou?.opsTrack?.sentToLegalAt || mou?.approvedAt || ["Approved", "Legal Review"].includes(mouStatus))
    return 3;
  if (["Verification", "Rework"].includes(mouStatus) || mou?.verifiedAt) return 2;
  if (["Requested"].includes(mouStatus)) return 1;
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
    (mou && ["Verification", "Approved", "Rework"].includes(mou.status) ? mou.updatedAt : undefined);

  const activeAt =
    c.status === "Active" ? c.firstLeadDate || c.updatedAt || c.createdAt : undefined;

  return [
    c.firstMeetingDate || c.createdAt,
    mou?.createdAt,
    verifiedAt,
    mou?.opsTrack?.sentToLegalAt || mou?.approvedAt,
    mou?.opsTrack?.financeApprovedAt,
    mou?.opsTrack?.draftSharedAt,
    mou?.opsTrack?.sentToClientAt || mou?.woSentAt,
    mou?.signedAt,
    c.materialsSharedAt,
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
  const current = stepIndex(consultant, mou, consultant.mouStatus);
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
          const opsOnly = [
            "SENT TO LEGAL",
            "FINANCE APPROVED",
            "DRAFT SHARED",
            "SENT TO CLIENT",
          ].includes(step);
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
                  {opsOnly && (
                    <span className="ml-1.5 text-[9px] font-medium uppercase tracking-wider text-[#b0b0b0]">
                      Ops
                    </span>
                  )}
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
                {step === "MATERIALS SHARED" && consultant.materialsSharedVia && (
                  <div className="mt-0.5 text-[10px] text-[#6b6b6b]">
                    via {consultant.materialsSharedVia === "auto_signed" ? "signed agreement" : "manual send"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-[11px] text-[#6b6b6b]">
        Post-approval legal → finance → draft → client → signed steps are marked by Operations only;
        this journey stays visible to B2B.
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
  const idx = Math.max(0, steps.indexOf(status));
  return (
    <div className="flex flex-wrap gap-1.5">
      {steps.map((s, i) => (
        <Badge key={s} tone={i <= idx ? (s === "Signed" ? "success" : "lime") : "neutral"}>
          {s}
        </Badge>
      ))}
    </div>
  );
}

