"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Rework is integrated into MOU / WO Queue — redirect. */
export default function ReworkRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/operations/queue?status=Rework");
  }, [router]);
  return <div className="p-8 text-sm text-[#6b6b6b]">Opening MOU queue…</div>;
}
