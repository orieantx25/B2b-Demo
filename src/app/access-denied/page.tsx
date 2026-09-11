"use client";

import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="section-title text-2xl">Access denied</h1>
      <p className="mt-2 text-sm text-[#6b6b6b]">
        Your role does not include this workspace. Contact your Super Admin if you need access.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          href="/b2b"
          className="rounded-xl bg-[#e31c24] px-4 py-2.5 text-sm font-semibold text-white"
        >
          Go to B2B
        </Link>
        <button
          type="button"
          className="rounded-xl border border-[#e5e5e5] px-4 py-2.5 text-sm font-semibold"
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
