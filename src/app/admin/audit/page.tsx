"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Audit removed from Admin nav. */
export default function AdminAuditRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return <div className="p-8 text-sm text-[#6b6b6b]">Redirecting…</div>;
}
