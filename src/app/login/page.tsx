"use client";

import { FormEvent, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { persistAuthUser } from "@/components/auth-provider";

function LoginForm() {
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }
      if (data.user) persistAuthUser(data.user);
      const next = search.get("next");
      // Hard navigate so cookies + auth bootstrap apply on Vercel
      window.location.href = next && next.startsWith("/") ? next : data.redirectTo || "/b2b";
    } catch {
      setError("Network error — try again");
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#111111] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 10%, rgba(227,28,36,0.35), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 80%, rgba(227,28,36,0.12), transparent 50%)",
        }}
      />
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/50">
          upGrad School of Technology
        </p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
          uGSOT
        </h1>
        <p className="mt-2 text-base font-semibold text-white/90">B2B Operations Portal</p>
        <p className="mt-2 text-sm text-white/55">
          Enter your assigned email. No password — access is role-based.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-[16px] border border-white/10 bg-white/5 p-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-[0.65rem] font-semibold uppercase tracking-wide text-white/50">
              Work email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@ugsot.edu"
              className="min-h-12 w-full rounded-xl border border-white/15 bg-black/30 px-3.5 text-base text-white outline-none placeholder:text-white/30 focus:border-[#e31c24]"
            />
          </div>
          {error && (
            <div className="rounded-lg border border-[#f5c2c4]/40 bg-[#e31c24]/15 px-3 py-2 text-sm text-[#ffc9cb]">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-[#e31c24] text-sm font-bold text-white transition hover:bg-[#c41820] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Continue"}
          </button>
        </form>

        <div className="mt-6 rounded-[14px] border border-white/10 bg-white/5 p-4 text-xs text-white/55">
          <div className="font-semibold text-white/80">Demo logins</div>
          <ul className="mt-2 space-y-1">
            <li>
              <button type="button" className="underline" onClick={() => setEmail("superadmin@ugsot.edu")}>
                superadmin@ugsot.edu
              </button>{" "}
              — Super Admin
            </li>
            <li>Any seeded member email (see Admin → Users after login)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111111]" />}>
      <LoginForm />
    </Suspense>
  );
}
