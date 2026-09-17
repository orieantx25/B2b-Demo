"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, EmptyState, Modal, PageHeader, StatusTone } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function OwnershipPage() {
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const transferOwnership = useAppStore((s) => s.transferOwnership);
  const persona = useAppStore((s) => s.persona);
  const canTransfer = persona === "admin" || persona === "operations";

  const [spocId, setSpocId] = useState<string | null>(null);
  const [transferConsultantId, setTransferConsultantId] = useState<string | null>(null);
  const [pickOwnerId, setPickOwnerId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const spocs = useMemo(() => {
    const b2b = members.filter((m) => m.role === "B2B Member" || m.role === "B2B Lead");
    return b2b
      .map((m) => ({
        ...m,
        count: consultants.filter((c) => c.ownerId === m.id).length,
      }))
      .filter((m) => m.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [members, consultants]);

  const underSpoc = useMemo(
    () => (spocId ? consultants.filter((c) => c.ownerId === spocId).sort((a, b) => a.name.localeCompare(b.name)) : []),
    [consultants, spocId]
  );

  const b2bMembers = useMemo(
    () =>
      members
        .filter((m) => m.role === "B2B Member" || m.role === "B2B Lead")
        .filter((m) => m.id !== underSpoc.find((c) => c.id === transferConsultantId)?.ownerId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [members, underSpoc, transferConsultantId]
  );

  const transferConsultant = transferConsultantId
    ? consultants.find((c) => c.id === transferConsultantId)
    : null;
  const newOwner = pickOwnerId ? members.find((m) => m.id === pickOwnerId) : null;
  const selectedSpoc = spocId ? members.find((m) => m.id === spocId) : null;

  const resetTransfer = () => {
    setTransferConsultantId(null);
    setPickOwnerId(null);
    setConfirmOpen(false);
  };

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Ownership"
        subtitle="SPOC → their consultants → transfer with confirmation."
      />

      {!spocId ? (
        spocs.length === 0 ? (
          <EmptyState title="No SPOCs with consultants" description="Assign owners from Consultant Master." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {spocs.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSpocId(s.id)}
                className="card-surface flex min-h-[88px] flex-col items-start justify-between p-4 text-left transition hover:border-[#e31c24]"
              >
                <div className="text-sm font-semibold text-[#111]">{s.name}</div>
                <div className="mt-1 text-xs text-[#6b6b6b]">
                  {s.role} · {s.region}
                </div>
                <div className="mt-3 text-xs font-semibold text-[#e31c24]">
                  {s.count} consultant{s.count === 1 ? "" : "s"} →
                </div>
              </button>
            ))}
          </div>
        )
      ) : (
        <div>
          <button
            type="button"
            onClick={() => {
              setSpocId(null);
              resetTransfer();
            }}
            className="mb-4 text-sm font-semibold text-[#e31c24]"
          >
            ← All SPOCs
          </button>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{selectedSpoc?.name}</h2>
            <p className="text-sm text-[#6b6b6b]">{underSpoc.length} consultants</p>
          </div>
          <div className="space-y-2">
            {underSpoc.map((c) => (
              <div key={c.id} className="card-surface flex flex-wrap items-center justify-between gap-3 p-3.5">
                <div className="min-w-0">
                  <Link href={`/consultants/${c.id}`} className="text-sm font-semibold hover:text-[#e31c24]">
                    {c.name}
                  </Link>
                  <div className="text-xs text-[#6b6b6b]">
                    {c.organization} · {c.consultantCode}
                  </div>
                  <div className="mt-1">
                    <Badge tone={StatusTone(c.status)}>{c.status}</Badge>
                  </div>
                </div>
                {canTransfer && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTransferConsultantId(c.id);
                      setPickOwnerId(null);
                    }}
                  >
                    Transfer ownership
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pick new B2B owner */}
      <Modal
        open={!!transferConsultantId && !confirmOpen}
        onClose={resetTransfer}
        title="Transfer ownership"
        wide
      >
        <p className="mb-3 text-sm text-[#6b6b6b]">
          Select a B2B team member as the new owner of{" "}
          <strong>{transferConsultant?.name}</strong>.
        </p>
        <div className="max-h-64 space-y-1 overflow-y-auto rounded-xl border border-[#e5e5e5]">
          {b2bMembers.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setPickOwnerId(m.id)}
              className={cn(
                "flex w-full flex-col border-b border-[#e5e5e5] px-3 py-2.5 text-left text-sm last:border-0 hover:bg-[#fafafa]",
                pickOwnerId === m.id && "bg-[#fdecec]"
              )}
            >
              <span className="font-semibold">{m.name}</span>
              <span className="text-xs text-[#6b6b6b]">
                {m.role} · {m.region}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={resetTransfer}>
            Cancel
          </Button>
          <Button disabled={!pickOwnerId} onClick={() => setConfirmOpen(true)}>
            Continue
          </Button>
        </div>
      </Modal>

      {/* Confirm */}
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm transfer">
        <p className="text-sm text-[#111]">
          Are you trying to transfer ownership of{" "}
          <strong>{transferConsultant?.name}</strong> to <strong>{newOwner?.name}</strong>?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            No
          </Button>
          <Button
            onClick={() => {
              if (transferConsultantId && pickOwnerId) {
                transferOwnership(transferConsultantId, pickOwnerId, "SPOC change");
                resetTransfer();
              }
            }}
          >
            Yes — transfer ownership
          </Button>
        </div>
      </Modal>
    </div>
  );
}
