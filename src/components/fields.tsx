"use client";

import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
  forwardRef,
} from "react";
import { Input, Label, Select, Textarea } from "@/components/ui";

type FieldBase = {
  label: string;
  hint?: string;
  className?: string;
  full?: boolean;
};

export function Field({
  label,
  hint,
  children,
  className,
  full,
}: FieldBase & { children: ReactNode }) {
  return (
    <div className={cn(full && "sm:col-span-2", className)}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-[#6b6b6b]">{hint}</p>}
    </div>
  );
}

export const EditableInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function EditableInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      className={cn(
        "bg-white border-[#e5e5e5] focus:border-[#e31c24] focus:shadow-[0_0_0_3px_rgba(227,28,36,0.12)]",
        className
      )}
      {...props}
    />
  );
});

export const EditableTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function EditableTextarea({ className, ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "bg-white border-[#e5e5e5] focus:border-[#e31c24] focus:shadow-[0_0_0_3px_rgba(227,28,36,0.12)]",
        className
      )}
      {...props}
    />
  );
});

export const EditableSelect = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function EditableSelect({ className, children, ...props }, ref) {
  return (
    <Select ref={ref} className={cn("bg-white", className)} {...props}>
      {children}
    </Select>
  );
});

export function LockedField({
  label,
  value,
  hint = "Locked — Management approved / system synced",
  className,
  full,
  multiline,
}: FieldBase & { value: string; multiline?: boolean }) {
  return (
    <div className={cn(full && "sm:col-span-2", className)}>
      <Label className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-[#6b6b6b]" />
        {label}
      </Label>
      {multiline ? (
        <div className="min-h-[72px] rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-3 py-2.5 text-sm text-[#111111] whitespace-pre-wrap">
          {value}
        </div>
      ) : (
        <div className="flex h-10 items-center rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] px-3 text-sm text-[#111111]">
          {value}
        </div>
      )}
      {hint && <p className="mt-1 text-[11px] text-[#6b6b6b]">{hint}</p>}
    </div>
  );
}

export function LockedInput({
  label,
  hint = "Locked — Management approved / system synced",
  className,
  full,
  ...props
}: FieldBase & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn(full && "sm:col-span-2", className)}>
      <Label className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-[#6b6b6b]" />
        {label}
      </Label>
      <Input
        readOnly
        tabIndex={-1}
        className="cursor-default bg-[#fafafa] text-[#111111] focus:border-[#e5e5e5] focus:shadow-none"
        {...props}
      />
      {hint && <p className="mt-1 text-[11px] text-[#6b6b6b]">{hint}</p>}
    </div>
  );
}

export function LockedTextarea({
  label,
  hint = "Locked — Management approved / system synced",
  className,
  full,
  ...props
}: FieldBase & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={cn(full && "sm:col-span-2", className)}>
      <Label className="flex items-center gap-1.5">
        <Lock className="h-3 w-3 text-[#6b6b6b]" />
        {label}
      </Label>
      <Textarea
        readOnly
        tabIndex={-1}
        className="cursor-default bg-[#fafafa] text-[#111111] focus:border-[#e5e5e5] focus:shadow-none"
        {...props}
      />
      {hint && <p className="mt-1 text-[11px] text-[#6b6b6b]">{hint}</p>}
    </div>
  );
}
