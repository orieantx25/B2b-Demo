"use client";

import Link from "next/link";
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
    <div className="min-h-screen bg-[#111111] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-5 py-12 sm:px-6 sm:py-16">
        <p className="label-micro text-[#e31c24]">upGrad School of Technology</p>
        <h1 className="mt-3 max-w-2xl font-[family-name:var(--font-display)] text-3xl font-extrabold tracking-[-0.03em] sm:text-5xl">
          B2B Operations Portal
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
          Centralize and streamline the consultant lifecycle — from meeting to activation to weekly reporting.
        </p>
        <div className="mt-8 grid gap-2.5 sm:mt-10 sm:grid-cols-3 sm:gap-3">
          {[
            { id: "b2b" as const, title: "B2B Portal View", desc: "Do the work" },
            { id: "operations" as const, title: "Operations View", desc: "Run the process" },
            { id: "leadership" as const, title: "Reports & Insights View", desc: "Measure & decide" },
          ].map((w) => (
            <button
              key={w.id}
              onClick={() => enter(w.id)}
              className="rounded-[14px] border border-white/10 bg-white/5 p-4 text-left transition duration-200 hover:border-[#e31c24]/40 hover:bg-white/10 active:scale-[0.99] sm:p-5"
            >
              <div className="font-[family-name:var(--font-display)] text-sm font-bold">{w.title}</div>
              <div className="mt-1 text-xs text-white/45">{w.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-10 grid gap-3 border-t border-white/10 pt-8 text-xs text-white/45 sm:mt-12 sm:grid-cols-4 sm:gap-6 sm:text-sm">
          <div>Less manual coordination</div>
          <div>Faster MOU / WO processing</div>
          <div>Consultant continuity</div>
          <div>Automated weekly reporting</div>
        </div>
        <Link
          href="/b2b"
          className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-[#e31c24] px-4 py-3 text-sm font-semibold text-white sm:w-fit"
        >
          Enter demo
        </Link>
      </div>
    </div>
  );
}
