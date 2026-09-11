"use client";

import { AppShell } from "@/components/app-shell";
import { AuthProvider } from "@/components/auth-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAppStore } from "@/store/app-store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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
      <div className="mx-auto max-w-6xl p-4 sm:p-6" aria-busy aria-label="Loading">
        <PageSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [queryClient] = useState(makeQueryClient);
  const bare =
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/session-expired";

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <StoreHydration>
          <AuthProvider>
            {bare ? children : <AppShell>{children}</AppShell>}
          </AuthProvider>
        </StoreHydration>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
