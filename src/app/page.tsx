"use client";

export default function HomeRedirect() {
  // Middleware sends / → /login or role home; this is a fallback.
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] text-white">
      <p className="text-sm text-white/60">Redirecting…</p>
    </div>
  );
}
