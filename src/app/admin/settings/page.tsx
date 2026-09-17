"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Settings removed from Admin nav. */
export default function AdminSettingsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin");
  }, [router]);
  return <div className="p-8 text-sm text-[#6b6b6b]">Redirecting…</div>;
}
