"use client";

import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";

export default function LandingPage() {
  const setPersona = useAppStore((s) => s.setPersona);
  const setWorkspace = useAppStore((s) => s.setWorkspace);
  const router = useRouter();

  const enter = (p: "b2b" | "operations" | "leadership") => {
    setPersona(p);
    if (p === "b2b") {
      setWorkspace("b2b");
      router.push("/b2b");
    } else if (p === "operations") {
      setWorkspace("operations");
      router.push("/operations");
    } else {
      setWorkspace("reports");
      router.push("/reports");
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
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-12 sm:px-6 sm:py-16">
        <p className="label-micro text-white/50">upGrad School of Technology</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] text-white sm:text-6xl md:text-7xl">
          uGSOT
        </h1>
        <p className="mt-3 max-w-xl text-lg font-semibold tracking-tight text-white/90 sm:text-xl">
          B2B Operations Portal
        </p>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
          Centralize the consultant lifecycle — from meeting to activation to weekly reporting.
        </p>
        <div className="mt-10 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
          {[
            { id: "b2b" as const, title: "B2B Portal", desc: "Scan · Schedule · Capture" },
            { id: "operations" as const, title: "Operations", desc: "Verify · Approve · WO" },
            { id: "leadership" as const, title: "Reports", desc: "Measure & decide" },
          ].map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => enter(w.id)}
              className="rounded-[14px] border border-white/10 bg-white/5 p-4 text-left transition duration-200 hover:border-[#e31c24]/40 hover:bg-white/10 active:scale-[0.99] sm:p-5"
            >
              <div className="font-[family-name:var(--font-display)] text-sm font-bold">{w.title}</div>
              <div className="mt-1 text-xs text-white/45">{w.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
