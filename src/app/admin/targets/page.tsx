"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** User targets moved to Operations. */
export default function AdminTargetsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/operations/targets");
  }, [router]);
  return <div className="p-8 text-sm text-[#6b6b6b]">Opening Ops user targets…</div>;
}
