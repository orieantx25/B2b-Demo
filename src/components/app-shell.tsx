"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppStore } from "@/store/app-store";
import { useAuth } from "@/components/auth-provider";
import type { Workspace } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui";
import { Sheet } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Tag,
  ClipboardList,
  AlertTriangle,
  GitMerge,
  PieChart,
  TrendingUp,
  FileBarChart,
  Menu,
  MoreHorizontal,
  Plus,
  IdCard,
  Camera,
  CalendarPlus,
  X,
  LogOut,
  KeyRound,
  Target,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { allowedWorkspaces, type AppRole } from "@/lib/auth/roles";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; short: string };
type NavGroup = { label: string; items: NavItem[] };
type ShellWorkspace = Workspace | "admin";

const b2bNav: NavItem[] = [
  { href: "/b2b", label: "Overview", icon: LayoutDashboard, short: "Home" },
  { href: "/b2b/meetings", label: "Meetings & Events", icon: Calendar, short: "Meetings" },
  { href: "/b2b/consultants", label: "My Consultants", icon: Users, short: "Consultants" },
  { href: "/b2b/mou", label: "MOU / WO", icon: FileText, short: "MOU" },
  { href: "/b2b/utm", label: "UTM & Coupons", icon: Tag, short: "UTM" },
];

const opsGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [{ href: "/operations", label: "Operations Overview", icon: LayoutDashboard, short: "Home" }],
  },
  {
    label: "MOU / WO",
    items: [
      { href: "/operations/queue", label: "MOU / WO Queue", icon: ClipboardList, short: "Queue" },
      { href: "/operations/signed", label: "Approved tracking", icon: FileText, short: "Approved" },
    ],
  },
  {
    label: "Master data",
    items: [
      { href: "/operations/consultants", label: "Consultant Master", icon: Users, short: "Master" },
      { href: "/operations/ownership", label: "Ownership", icon: GitMerge, short: "Owner" },
      { href: "/operations/utm", label: "UTM & Coupons", icon: Tag, short: "UTM" },
      { href: "/operations/targets", label: "User Targets", icon: Target, short: "Targets" },
    ],
  },
  {
    label: "Exceptions",
    items: [{ href: "/operations/exceptions", label: "Exceptions", icon: AlertTriangle, short: "Alerts" }],
  },
];

const reportsNav: NavItem[] = [
  { href: "/reports", label: "Executive Overview", icon: PieChart, short: "Exec" },
  { href: "/reports/b2b", label: "B2B Performance", icon: TrendingUp, short: "B2B" },
  { href: "/reports/targets", label: "Targets vs Achievement", icon: Target, short: "Targets" },
  { href: "/reports/consultants", label: "Consultant Performance", icon: Users, short: "Cons." },
  { href: "/reports/mou", label: "MOU / WO Efficiency", icon: FileText, short: "MOU" },
  { href: "/reports/weekly", label: "Weekly Reports", icon: FileBarChart, short: "Weekly" },
  { href: "/reports/consolidated", label: "Consolidated", icon: FileBarChart, short: "Pack" },
];

const adminNav: NavItem[] = [
  { href: "/admin", label: "Admin Overview", icon: LayoutDashboard, short: "Home" },
  { href: "/admin/users", label: "Users & Roles", icon: Users, short: "Users" },
  { href: "/admin/access", label: "Access Matrix", icon: KeyRound, short: "Access" },
];

const ALL_WORKSPACES: { id: ShellWorkspace; label: string; short: string; path: string }[] = [
  { id: "b2b", label: "B2B", short: "B2B", path: "/b2b" },
  { id: "operations", label: "Ops", short: "Ops", path: "/operations" },
  { id: "reports", label: "Reports", short: "Reports", path: "/reports" },
  { id: "admin", label: "Admin", short: "Admin", path: "/admin" },
];

function flatOps(): NavItem[] {
  return opsGroups.flatMap((g) => g.items);
}

function isNavActive(pathname: string, href: string) {
  if (href === "/b2b" || href === "/operations" || href === "/reports" || href === "/admin") {
    return pathname === href;
  }
  if (href === "/b2b/consultants") {
    return pathname.startsWith("/b2b/consultants") || pathname.startsWith("/consultants/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition duration-150",
        active
          ? "bg-[#fdecec] font-semibold text-[#e31c24]"
          : "text-[#6b6b6b] hover:bg-[#fafafa] hover:text-[#111111]"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function detectWorkspace(pathname: string): ShellWorkspace {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/operations")) return "operations";
  if (pathname.startsWith("/reports")) return "reports";
  return "b2b";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const setWorkspace = useAppStore((s) => s.setWorkspace);
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);

  const shellWorkspace = detectWorkspace(pathname);
  const role = (user?.role || "b2b_member") as AppRole;
  // Path fallback: if middleware let them into /admin, they are elevated even before /me resolves
  const isElevatedAdmin =
    role === "super_admin" ||
    role === "admin" ||
    pathname.startsWith("/admin");
  const workspaces = useMemo(() => {
    if (isElevatedAdmin) return ALL_WORKSPACES;
    const allowed = allowedWorkspaces(role);
    return ALL_WORKSPACES.filter((w) => allowed.includes(w.id));
  }, [role, isElevatedAdmin]);

  const flatNav =
    shellWorkspace === "b2b"
      ? b2bNav
      : shellWorkspace === "operations"
        ? flatOps()
        : shellWorkspace === "admin"
          ? adminNav
          : reportsNav;
  const mobileTabs = flatNav.slice(0, 4);
  const overflowNav = flatNav.slice(4);
  const showB2bCapture =
    shellWorkspace === "b2b" &&
    (pathname.startsWith("/b2b") || pathname.startsWith("/consultants/"));
  const showWorkspaceBar = workspaces.length > 1;

  useEffect(() => {
    if (shellWorkspace !== "admin") {
      setWorkspace(shellWorkspace);
    }
    setMenuOpen(false);
    setMoreOpen(false);
    setCaptureOpen(false);
  }, [pathname, shellWorkspace, setWorkspace]);

  const switchWorkspace = (w: ShellWorkspace) => {
    const target = ALL_WORKSPACES.find((x) => x.id === w);
    if (target) router.push(target.path);
  };

  const goCapture = (target: "cardx" | "schedule" | "photo") => {
    setCaptureOpen(false);
    if (target === "cardx") router.push("/b2b?cardx=1");
    if (target === "schedule") router.push("/b2b/meetings?schedule=1");
    if (target === "photo") router.push("/b2b/meetings?photo=1");
  };

  const workspaceLabel =
    ALL_WORKSPACES.find((w) => w.id === shellWorkspace)?.label || "B2B";
  const initials = (user?.name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#111111]">
      <header className="sticky top-0 z-40 border-b border-black/80 bg-[#111111] text-white">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3">
          <button
            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href={workspaces[0]?.path || "/b2b"}
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e31c24] font-[family-name:var(--font-display)] text-[11px] font-bold tracking-tight text-white shadow-[0_0_0_1px_rgba(227,28,36,0.35)]">
              uG
            </span>
            <span className="hidden min-w-0 flex-col leading-none sm:flex">
              <span className="font-[family-name:var(--font-display)] text-[15px] font-bold tracking-tight">
                uGSOT
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-white/40">
                {workspaceLabel}
              </span>
            </span>
          </Link>

          {showWorkspaceBar && (
            <nav
              className="ml-1 hidden min-w-0 flex-1 items-center justify-center md:flex"
              aria-label="Workspace views"
            >
              <div className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] p-1">
                {workspaces.map((w) => {
                  const active = shellWorkspace === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => switchWorkspace(w.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative min-h-9 rounded-full px-4 text-[12px] font-semibold transition duration-200",
                        active
                          ? "bg-[#e31c24] text-white shadow-[0_4px_14px_rgba(227,28,36,0.35)]"
                          : "text-white/55 hover:bg-white/8 hover:text-white"
                      )}
                    >
                      {w.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          )}

          {!showWorkspaceBar && <div className="flex-1" />}

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1 pr-3 lg:flex">
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 font-[family-name:var(--font-display)] text-[11px] font-bold text-white"
                aria-hidden
              >
                {initials}
              </span>
              <div className="min-w-0 text-left leading-tight">
                <div className="max-w-[9.5rem] truncate text-[12px] font-semibold">
                  {user?.name || "Signed in"}
                </div>
                <div className="max-w-[9.5rem] truncate text-[10px] text-white/40">
                  {user?.email || user?.role?.replace(/_/g, " ")}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/12 text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
              aria-label="Home"
              title="Back to Overview"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile workspace strip — keeps Super Admin all-views reachable */}
        {showWorkspaceBar && (
          <div
            className="flex gap-1.5 overflow-x-auto border-t border-white/[0.06] px-3 py-2 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Workspace views"
          >
            {workspaces.map((w) => {
              const active = shellWorkspace === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => switchWorkspace(w.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "min-h-10 shrink-0 rounded-full px-3.5 text-xs font-semibold transition",
                    active
                      ? "bg-[#e31c24] text-white"
                      : "bg-white/[0.06] text-white/65"
                  )}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} title="Navigation" side="left">
        <div className="px-2 pb-2 text-xs text-[#6b6b6b]">
          {user?.name} · {user?.email}
        </div>
        <Separator className="mb-2" />
        {workspaces.length > 1 && (
          <div className="mb-3 px-1">
            <div className="label-micro mb-1.5 px-2">
              {isElevatedAdmin ? "All views" : "Workspace"}
            </div>
            <div className="flex flex-col gap-0.5">
              {workspaces.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => {
                    switchWorkspace(w.id);
                    setMenuOpen(false);
                  }}
                  className={cn(
                    "min-h-11 rounded-xl px-2.5 py-2 text-left text-sm",
                    shellWorkspace === w.id
                      ? "bg-[#fdecec] font-semibold text-[#e31c24]"
                      : "text-[#6b6b6b] hover:bg-[#fafafa]"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
            <Separator className="my-3" />
          </div>
        )}
        {shellWorkspace === "operations"
          ? opsGroups.map((g) => (
              <div key={g.label} className="mb-3">
                <div className="label-micro mb-1 px-2.5">{g.label}</div>
                {g.items.map((item) => (
                  <NavLink
                    key={item.href}
                    item={item}
                    active={isNavActive(pathname, item.href)}
                    onNavigate={() => setMenuOpen(false)}
                  />
                ))}
              </div>
            ))
          : flatNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isNavActive(pathname, item.href)}
                onNavigate={() => setMenuOpen(false)}
              />
            ))}
        <Separator className="my-3" />
        <button
          type="button"
          onClick={() => void logout()}
          className="flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-[#e31c24]"
        >
          <LogOut className="h-4 w-4" /> Back to Overview
        </button>
      </Sheet>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen} title="More" side="right">
        {overflowNav.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            active={isNavActive(pathname, item.href)}
            onNavigate={() => setMoreOpen(false)}
          />
        ))}
      </Sheet>

      <Sheet open={captureOpen} onOpenChange={setCaptureOpen} title="Quick capture" side="bottom">
        <div className="space-y-1 p-1 pb-4">
          {(
            [
              { t: "cardx" as const, title: "Scan card", sub: "Visiting card OCR assist", Icon: IdCard, tone: "bg-[#fdecec] text-[#e31c24]" },
              { t: "schedule" as const, title: "Schedule meeting", sub: "New field meeting", Icon: CalendarPlus, tone: "bg-[#111111] text-white" },
              { t: "photo" as const, title: "Add field photo", sub: "Geotagged meeting evidence", Icon: Camera, tone: "bg-[#fff4e8] text-[#b45309]" },
            ] as const
          ).map((row) => (
            <button
              key={row.t}
              type="button"
              onClick={() => goCapture(row.t)}
              className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-[#fafafa]"
            >
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", row.tone)}>
                <row.Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-sm font-semibold">{row.title}</span>
                <span className="text-xs text-[#6b6b6b]">{row.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </Sheet>

      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-[5.5rem] hidden h-[calc(100vh-5.5rem)] w-56 shrink-0 overflow-y-auto border-r border-[#e5e5e5] bg-white lg:block">
          <div className="px-3 py-4">
            <div className="label-micro mb-3 px-2">
              {shellWorkspace === "b2b"
                ? "B2B Portal"
                : shellWorkspace === "operations"
                  ? "Operations"
                  : shellWorkspace === "admin"
                    ? "Super Admin"
                    : "Reports"}
            </div>
            {shellWorkspace === "operations" ? (
              opsGroups.map((g) => (
                <div key={g.label} className="mb-4">
                  <div className="label-micro mb-1 px-2.5">{g.label}</div>
                  <nav className="space-y-0.5">
                    {g.items.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        active={isNavActive(pathname, item.href)}
                      />
                    ))}
                  </nav>
                </div>
              ))
            ) : (
              <nav className="space-y-0.5">
                {flatNav.map((item) => (
                  <NavLink key={item.href} item={item} active={isNavActive(pathname, item.href)} />
                ))}
              </nav>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-4 pb-24 sm:px-5 sm:py-5 lg:px-8 lg:pb-5">
          {children}
        </main>
      </div>

      <div className="fixed bottom-[5.75rem] right-3 z-50 flex w-[min(20rem,calc(100vw-5.5rem))] flex-col gap-2 sm:bottom-4 sm:right-4 lg:bottom-4 lg:right-4 lg:w-[min(20rem,calc(100vw-2rem))]">
        {toasts.map((t) => (
          <div key={t.id} className="card-surface flex items-start gap-2 px-3.5 py-2.5" role="status">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{t.title}</div>
              {t.description && <div className="text-xs text-[#6b6b6b]">{t.description}</div>}
            </div>
            {t.variant === "success" && <Badge tone="success">Done</Badge>}
            <button
              type="button"
              aria-label="Dismiss"
              className="min-h-8 min-w-8 shrink-0 rounded-md p-1 text-[#6b6b6b] hover:bg-[#f0f0f0]"
              onClick={() => dismissToast(t.id)}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {showB2bCapture && (
        <button
          type="button"
          onClick={() => setCaptureOpen(true)}
          className="fixed bottom-[4.75rem] right-4 z-40 flex min-h-14 items-center gap-1.5 rounded-full bg-[#e31c24] py-3.5 pl-3.5 pr-4 text-white shadow-[0_8px_24px_rgba(227,28,36,0.35)] transition duration-150 hover:bg-[#c41820] active:scale-95 lg:hidden"
          aria-label="Quick capture"
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs font-bold tracking-wide">Capture</span>
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#e5e5e5] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm lg:hidden">
        {mobileTabs.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold",
                active ? "text-[#e31c24]" : "text-[#6b6b6b]"
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl",
                  active && "bg-[#fdecec]"
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="max-w-full truncate">{item.short}</span>
            </Link>
          );
        })}
        {overflowNav.length > 0 && (
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-semibold text-[#6b6b6b]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl">
              <MoreHorizontal className="h-4 w-4" />
            </span>
            More
          </button>
        )}
      </nav>
    </div>
  );
}
