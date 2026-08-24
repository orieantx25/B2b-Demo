import { cn } from "@/lib/utils";
import {
  ButtonHTMLAttributes,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
    size?: "sm" | "md" | "lg";
  }
>(function Button({ className, variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98]",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-10 px-4 text-sm",
        size === "lg" && "h-11 px-5 text-sm",
        variant === "primary" && "bg-[#e31c24] text-white hover:bg-[#c41820]",
        variant === "secondary" && "bg-[#111111] text-white hover:bg-[#222222]",
        variant === "ghost" && "bg-transparent text-[#111111] hover:bg-[#f0f0f0] rounded-lg",
        variant === "outline" &&
          "border border-[#e5e5e5] bg-white text-[#111111] hover:bg-[#fafafa] hover:border-[#ccc]",
        variant === "danger" && "bg-[#e31c24] text-white hover:bg-[#c41820]",
        className
      )}
      {...props}
    />
  );
});

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm text-[#111111] outline-none transition focus:border-[#e31c24] focus:shadow-[0_0_0_3px_rgba(227,28,36,0.12)]",
          className
        )}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[88px] w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#e31c24] focus:shadow-[0_0_0_3px_rgba(227,28,36,0.12)]",
          className
        )}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "h-10 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm outline-none transition focus:border-[#e31c24] focus:shadow-[0_0_0_3px_rgba(227,28,36,0.12)]",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <label className={cn("label-micro mb-1.5 block", className)}>{children}</label>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "lime" | "success" | "warn" | "danger" | "info";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-semibold tracking-wide",
        tone === "neutral" && "bg-[#f0f0f0] text-[#6b6b6b]",
        tone === "lime" && "bg-[#fdecec] text-[#e31c24] border border-[#f5c2c4]",
        tone === "success" && "bg-[#e8f5ef] text-[#1b7a4e] border border-[#b7dfc9]",
        tone === "warn" && "bg-[#fff4e8] text-[#b45309] border border-[#f0d2ad]",
        tone === "danger" && "bg-[#fdecec] text-[#e31c24] border border-[#f5c2c4]",
        tone === "info" && "bg-[#eff6ff] text-[#1d4ed8]"
      )}
    >
      {children}
    </span>
  );
}

export function Kpi({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "ink" | "red" | "amber" | "green" | "blue" | "violet";
}) {
  const valueColor = {
    ink: "text-[#111111]",
    red: "text-[#e31c24]",
    amber: "text-[#b45309]",
    green: "text-[#1b7a4e]",
    blue: "text-[#1d4ed8]",
    violet: "text-[#7c3aed]",
  }[tone];

  return (
    <div className="flex min-h-[96px] flex-col justify-between rounded-[14px] border border-[#e5e5e5] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(17,17,17,0.04)]">
      <div className="text-[0.62rem] font-semibold uppercase leading-tight tracking-[0.07em] text-[#6b6b6b]">
        {label}
      </div>
      <div className={cn("kpi-value mt-2 text-[1.85rem] leading-none sm:text-[2.1rem]", valueColor)}>
        {typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </div>
      {hint ? (
        <div className="mt-2 text-[0.72rem] leading-snug text-[#6b6b6b]">{hint}</div>
      ) : (
        <div className="mt-2 h-[0.72rem]" aria-hidden />
      )}
    </div>
  );
}

export function KpiSection({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-5", className)}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="h-5 w-[3px] shrink-0 rounded-full bg-[#e31c24]" />
        <h2 className="section-title text-[1.05rem] text-[#111111]">{title}</h2>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6 lg:gap-3">{children}</div>
    </section>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
}: {
  title: string;
  /** @deprecated ignored — SoT unified panels */
  tone?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-[14px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(17,17,17,0.04)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
        <span className="section-title text-[0.9rem] text-[#111111]">{title}</span>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="section-accent min-w-0">
        <h1 className="section-title text-[#111111]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-[#6b6b6b] leading-snug">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card-surface border-dashed px-6 py-10 text-center">
      <div className="text-sm font-semibold text-[#111111]">{title}</div>
      {description && <p className="mt-1 text-sm text-[#6b6b6b]">{description}</p>}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  xl,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
  xl?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-start sm:p-4 sm:pt-[4vh] animate-in">
      <div
        className={cn(
          "w-full max-h-[94vh] overflow-y-auto rounded-t-2xl border border-[#e5e5e5] bg-white shadow-xl sm:rounded-[14px]",
          xl ? "sm:max-w-4xl" : wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        )}
        role="dialog"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 py-3.5">
          <h2 className="section-title text-[0.95rem]">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-[#6b6b6b] hover:bg-[#f0f0f0] hover:text-[#111111]"
          >
            Close
          </button>
        </div>
        <div className="p-4 pb-8 sm:pb-4">{children}</div>
      </div>
    </div>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-[#e5e5e5] bg-white shadow-xl sm:rounded-l-[14px]">
        <div className="sticky top-0 flex items-center justify-between border-b border-[#e5e5e5] bg-white px-4 py-3.5">
          <h2 className="section-title text-[0.95rem]">{title}</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-[#6b6b6b]">
            Close
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function SourceTag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#6b6b6b]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#e31c24]" />
      {children}
    </span>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition duration-150",
        active
          ? "border-[#e31c24] bg-[#e31c24] text-white"
          : "border-[#e5e5e5] bg-white text-[#6b6b6b] hover:border-[#ccc] hover:bg-[#fafafa]"
      )}
    >
      {children}
    </button>
  );
}

export function StatusTone(status: string): "neutral" | "lime" | "success" | "warn" | "danger" | "info" {
  const s = status.toLowerCase();
  if (["active", "signed", "approved", "mapped", "completed", "reviewed"].some((x) => s.includes(x)))
    return "success";
  if (["rework", "sla", "awaiting", "verification", "requested", "pending"].some((x) => s.includes(x)))
    return "warn";
  if (["inactive", "rejected", "cancelled"].some((x) => s.includes(x))) return "danger";
  if (["utm", "wo"].some((x) => s.includes(x))) return "info";
  return "neutral";
}
