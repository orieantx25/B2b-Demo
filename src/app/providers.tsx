"use client";

import { AppShell } from "@/components/app-shell";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAppStore } from "@/store/app-store";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PageSkeleton } from "@/components/ui/skeleton";

function StoreHydration({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const result = useAppStore.persist.rehydrate();
    Promise.resolve(result).finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl p-4 sm:p-6" aria-busy aria-label="Loading demo">
        <PageSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/") {
    return (
      <ErrorBoundary>
        <StoreHydration>{children}</StoreHydration>
      </ErrorBoundary>
    );
  }
  return (
    <ErrorBoundary>
      <StoreHydration>
        <AppShell>{children}</AppShell>
      </StoreHydration>
    </ErrorBoundary>
  );
}
