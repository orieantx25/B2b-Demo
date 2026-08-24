"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppStore } from "@/store/app-store";
import { Badge, Button, Label, Modal, PageHeader, Select, StatusTone, Textarea } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function OwnershipPage() {
  const ownership = useAppStore((s) => s.ownership);
  const consultants = useAppStore((s) => s.consultants);
  const members = useAppStore((s) => s.members);
  const mergeRequests = useAppStore((s) => s.mergeRequests);
  const transferOwnership = useAppStore((s) => s.transferOwnership);
  const resolveMerge = useAppStore((s) => s.resolveMerge);
  const persona = useAppStore((s) => s.persona);

  const [open, setOpen] = useState(false);
  const [consultantId, setConsultantId] = useState("");
  const [newOwnerId, setNewOwnerId] = useState("");
  const [reason, setReason] = useState("Admin transfer");
  const [comments, setComments] = useState("");

  const canTransfer = persona === "admin" || persona === "operations";

  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Ownership"
        subtitle="History never deleted. Relationship survives SPOC changes."
        actions={
          canTransfer ? (
            <Button onClick={() => setOpen(true)}>Transfer ownership</Button>
          ) : undefined
        }
      />

      <section className="mb-6 card-surface">
        <div className="border-b px-4 py-3 text-sm font-semibold">Merge requests</div>
        <ul className="divide-y divide-[#e5e5e5]">
          {mergeRequests.map((m) => {
            const p = consultants.find((c) => c.id === m.primaryId);
            const d = consultants.find((c) => c.id === m.duplicateId);
            return (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <div className="font-medium">
                    {p?.name} ← {d?.name}
                  </div>
                  <div className="text-xs text-[#6b6b6b]">{m.reason}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={StatusTone(m.status)}>{m.status}</Badge>
                  {m.status === "Pending" && canTransfer && (
                    <>
                      <Button size="sm" onClick={() => resolveMerge(m.id, true)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => resolveMerge(m.id, false)}>
                        Reject
                      </Button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="overflow-x-auto card-surface">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f6f6f6] text-xs text-[#6b6b6b]">
            <tr>
              <th className="px-3 py-2">Consultant</th>
              <th className="px-3 py-2">Owner</th>
              <th className="px-3 py-2">From</th>
              <th className="px-3 py-2">To</th>
              <th className="px-3 py-2">Reason</th>
            </tr>
          </thead>
          <tbody>
            {ownership.slice(0, 60).map((o) => {
              const c = consultants.find((x) => x.id === o.consultantId);
              return (
                <tr key={o.id} className="border-t border-[#e5e5e5]">
                  <td className="px-3 py-2">
                    <Link href={`/consultants/${o.consultantId}`} className="hover:underline">
                      {c?.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2">{o.ownerName}</td>
                  <td className="px-3 py-2 text-xs">{formatDate(o.fromDate)}</td>
                  <td className="px-3 py-2 text-xs">{o.toDate ? formatDate(o.toDate) : "Current"}</td>
                  <td className="px-3 py-2 text-xs">{o.reason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Transfer ownership">
        <div className="space-y-3">
          <div>
            <Label>Consultant</Label>
            <Select value={consultantId} onChange={(e) => setConsultantId(e.target.value)}>
              <option value="">Select…</option>
              {consultants.slice(0, 80).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>New owner</Label>
            <Select value={newOwnerId} onChange={(e) => setNewOwnerId(e.target.value)}>
              <option value="">Select…</option>
              {members
                .filter((m) => m.role === "B2B Member" || m.role === "B2B Lead")
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </Select>
          </div>
          <div>
            <Label>Reason</Label>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              <option>SPOC change</option>
              <option>Admin transfer</option>
              <option>Region realignment</option>
            </Select>
          </div>
          <div>
            <Label>Comments</Label>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
          <Button
            disabled={!consultantId || !newOwnerId}
            onClick={() => {
              transferOwnership(consultantId, newOwnerId, reason, comments);
              setOpen(false);
            }}
          >
            Confirm transfer
          </Button>
        </div>
      </Modal>
    </div>
  );
}
