"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** My Performance removed from B2B nav — redirect to Overview. */
export default function B2BPerformanceRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/b2b");
  }, [router]);
  return (
    <div className="p-8 text-sm text-[#6b6b6b]" aria-busy>
      Redirecting to Overview…
    </div>
  );
}
