"use client";

import { PageHeader } from "@/components/ui";
import { ACCESS_MATRIX } from "@/lib/auth/roles";

export default function AccessMatrixPage() {
  return (
    <div className="animate-in pb-16">
      <PageHeader
        title="Access matrix"
        subtitle="Which role can open which workspace and perform key actions."
      />
      <div className="overflow-x-auto card-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#fafafa] text-[11px] font-semibold uppercase tracking-wide text-[#444]">
            <tr>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Workspaces</th>
              <th className="px-4 py-3">Capabilities</th>
            </tr>
          </thead>
          <tbody>
            {ACCESS_MATRIX.map((row) => (
              <tr key={row.role} className="border-t border-[#e5e5e5]">
                <td className="px-4 py-3 font-semibold">{row.label}</td>
                <td className="px-4 py-3 text-[#6b6b6b]">{row.workspaces.join(" · ")}</td>
                <td className="px-4 py-3 text-[#6b6b6b]">{row.capabilities.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
