"use client";

import Link from "next/link";

export default function SessionExpiredPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="section-title text-2xl">Session expired</h1>
      <p className="mt-2 text-sm text-[#6b6b6b]">Sign in again with your assigned work email.</p>
      <Link
        href="/login"
        className="mt-6 rounded-xl bg-[#e31c24] px-4 py-2.5 text-sm font-semibold text-white"
      >
        Back to login
      </Link>
    </div>
  );
}
