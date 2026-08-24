"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Portal error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="section-accent">
            <h1 className="section-title text-xl text-[#111111]">Something went wrong</h1>
            <p className="mt-2 max-w-md text-sm text-[#6b6b6b]">
              The demo hit an unexpected error. You can reload to restore the last session, or clear
              session storage to start fresh from seed data.
            </p>
            {this.state.message && (
              <p className="mt-2 font-mono text-[11px] text-[#9a9a9a]">{this.state.message}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => window.location.reload()}>Reload</Button>
            <Button
              variant="outline"
              onClick={() => {
                try {
                  sessionStorage.removeItem("ugsot-b2b-demo");
                } catch {
                  /* ignore */
                }
                window.location.href = "/";
              }}
            >
              Reset demo
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
