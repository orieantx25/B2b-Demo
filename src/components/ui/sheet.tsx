"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";

export function Sheet({
  open,
  onOpenChange,
  title,
  children,
  side = "left",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
  side?: "left" | "right" | "bottom";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col bg-white shadow-xl outline-none transition duration-200",
            side === "bottom"
              ? "inset-x-0 bottom-0 max-h-[75vh] w-full rounded-t-2xl data-[state=open]:animate-in"
              : cn(
                  "top-0 h-full w-[min(20rem,88vw)]",
                  side === "left" ? "left-0" : "right-0",
                  "data-[state=open]:animate-in"
                )
          )}
        >
          <div className="relative flex items-center justify-between border-b border-[#e5e5e5] px-4 py-3.5">
            {side === "bottom" && (
              <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[#e5e5e5]" />
            )}
            <Dialog.Title className="section-title text-[0.95rem]">{title || "Menu"}</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-[#6b6b6b] hover:bg-[#f0f0f0]">
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
