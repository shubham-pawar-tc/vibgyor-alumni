"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Award,
  BadgeCheck,
  Compass,
  Handshake,
  FileText,
  HandCoins,
  IndianRupee,
  Repeat,
  Store,
  Copy,
  Database,
  FileLock2,
  Flag,
  KeyRound,
  ListChecks,
  NotebookPen,
  CalendarCheck,
  MessageCircle,
  Send,
  UsersRound,
  Briefcase,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  GraduationCap,
  HeartHandshake,
  Home,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  MessagesSquare,
  PlayCircle,
  RotateCcw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { campusName, personas, roleLabels } from "@/lib/data";
import { activeBadge, useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { findDuplicates, unmappedValues } from "@/lib/admin";
import { Avatar, Logo, Pill, Skeleton } from "./ui";
import { motion } from "motion/react";
import { Drawer, Dropdown, PageTransition } from "./motion";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  count?: number;
  soon?: boolean;
  section?: string;
}

function navFor(me: User, counts: { verif: number; reports: number; consent: number; vouch: number; jobs: number; dms: number; moderation: number; requests: number; dupes: number; unmapped: number; docs: number; intros: number }): NavItem[] {
  const home: NavItem = { href: "/portal", label: "Home", icon: Home };
  switch (me.role) {
    case "STU":
      return [
        home,
        { href: "/portal/mentors", label: "Find a mentor", icon: Search },
        { href: "/portal/messages", label: "Messages", icon: MessagesSquare },
        { href: "/portal/jobs", label: "Internships", icon: Briefcase },
        { href: "/portal/careers", label: "MyCareerZ", icon: Compass },
        { href: "/portal/events", label: "Events", icon: CalendarDays },
        { href: "/portal/profile", label: "My profile", icon: UserRound },
      ];
    case "PAR":
      return [
        home,
        { href: "/portal/consent", label: "Consent centre", icon: ShieldCheck },
        { href: "/portal/child-chats", label: "Mentor chats", icon: MessagesSquare },
        { href: "/portal/careers", label: "MyCareerZ", icon: Compass },
        { href: "/portal/events", label: "Events", icon: CalendarDays },
      ];
    case "ALP":
      return [
        home,
        { href: "/portal/profile", label: "My profile", icon: UserRound },
        { href: "/portal/directory", label: "Alumni directory", icon: Lock },
        { href: "/portal/documents", label: "School documents", icon: FileText },
        { href: "/portal/give", label: "Give", icon: HandCoins },
      ];
    case "ALU":
      return [
        home,
        { href: "/portal/profile", label: "My profile", icon: UserRound },
        { href: "/portal/directory", label: "Alumni directory", icon: Users },
        { href: "/portal/groups", label: "Batch groups", icon: UsersRound },
        { href: "/portal/chats", label: "Chats", icon: MessageCircle, count: counts.dms },
        { href: "/portal/jobs", label: "Jobs", icon: Briefcase },
        { href: "/portal/events", label: "Events", icon: CalendarDays },
        { href: "/portal/business", label: "Business directory", icon: Store },
        { href: "/portal/invite", label: "Invite friends", icon: Send },
        ...(me.badges?.some((b) => b.type === "Mentor") ? [{ href: "/portal/messages", label: "Mentor inbox", icon: MessagesSquare }] : []),
        { href: "/portal/vouch", label: "Vouch for batchmates", icon: HeartHandshake, count: counts.vouch },
        { href: "/portal/mentor", label: activeBadge(me, "Mentor") ? "Mentor badge" : "Become a mentor", icon: GraduationCap },
        { href: "/portal/badges", label: "My badges", icon: Award },
        { href: "/portal/documents", label: "School documents", icon: FileText },
        { href: "/portal/give", label: "Give", icon: HandCoins },
      ];
    case "CAD":
    case "GAO":
    case "SAD": {
      const group = me.role !== "CAD";
      return [
        { href: "/portal", label: "Dashboard", icon: Home },
        { section: "Queues", href: "/portal/admin/verification", label: "Verification", icon: BadgeCheck, count: counts.verif },
        { href: "/portal/admin/safeguarding", label: "Safeguarding", icon: ShieldAlert, count: counts.reports },
        { href: "/portal/admin/moderation", label: "Moderation", icon: Flag, count: counts.moderation },
        { href: "/portal/admin/requests", label: "Data requests", icon: FileLock2, count: counts.requests },
        { href: "/portal/admin/content", label: "Jobs & events", icon: CalendarCheck, count: counts.jobs },
        { href: "/portal/admin/documents", label: "Document requests", icon: FileText, count: counts.docs },
        { href: "/portal/admin/intros", label: "Guide introductions", icon: Handshake, count: counts.intros },
        { section: "People & data", href: "/portal/admin/records", label: "Alumni records", icon: Database },
        { href: "/portal/admin/engagement", label: "Engagement log", icon: NotebookPen },
        { href: "/portal/admin/consents", label: "Student consents", icon: ClipboardCheck, count: counts.consent },
        { href: "/portal/admin/badges", label: "Badges", icon: Award },
        ...(group
          ? [
              { href: "/portal/admin/duplicates", label: "Duplicates", icon: Copy, count: counts.dupes },
              { href: "/portal/admin/masters", label: "Master lists", icon: ListChecks, count: counts.unmapped },
            ]
          : []),
        { section: "Communication", href: "/portal/admin/broadcast", label: "Broadcasts", icon: Megaphone },
        { section: "Governance", href: "/portal/admin/audit", label: "Audit log", icon: FileClock },
        { href: "/portal/admin/staff", label: me.role === "SAD" ? "Staff & scopes" : me.role === "GAO" ? "Campus staff" : "Teachers", icon: UsersRound },
        ...(me.role === "SAD"
          ? [
              { href: "/portal/finance", label: "Finance", icon: IndianRupee },
              { href: "/portal/admin/permissions", label: "Permissions", icon: KeyRound },
              { href: "/portal/admin/settings", label: "Settings", icon: Settings },
            ]
          : []),
      ];
    }
    case "TCH":
      return [
        home,
        { href: "/portal/teacher/interest", label: "Student interest", icon: Briefcase },
        { href: "/portal/teacher/refer", label: "Refer to MyCareerZ", icon: Compass },
        { href: "/portal/admin/engagement", label: "Engagement log", icon: NotebookPen },
      ];
    case "FIN":
      return [home, { href: "/portal/finance", label: "Finance", icon: IndianRupee }];
    case "MCZ":
      return [home, { href: "/portal/mcz", label: "MyCareerZ", icon: Compass }];
    default:
      return [home];
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { me, state, hydrated, logout, reset } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNav, setMobileNav] = useState(false);

  useEffect(() => {
    if (hydrated && !me) router.replace("/login");
  }, [hydrated, me, router]);

  useEffect(() => setMobileNav(false), [pathname]);

  if (!hydrated || !me) {
    return (
      <div className="min-h-screen lg:pl-[var(--sidebar-w)]" role="status" aria-label="Loading your portal">
        <aside className="fixed inset-y-0 left-0 hidden w-[var(--sidebar-w)] space-y-3 border-r border-border bg-surface p-5 lg:block">
          <Skeleton className="h-8 w-36" />
          <div className="space-y-3 pt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-4" />
            ))}
          </div>
        </aside>
        <div className="h-[var(--header-h)] border-b border-border bg-surface" />
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96 max-w-full" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-[var(--card-radius)]" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-[var(--card-radius)]" />
        </div>
      </div>
    );
  }

  const scope = me.role === "GAO" || me.role === "SAD" ? null : me.campusIds;
  const inScope = (cid: string) => !scope || scope.includes(cid);
  const counts = {
    verif: state.verifications.filter((v) => v.status === "pending" && inScope(v.campusId)).length + state.badgeRequests.filter((b) => b.status === "pending" && inScope(b.campusId)).length,
    reports: state.reports.filter((r) => r.kind === "message" && r.status === "open" && inScope(r.campusId)).length,
    moderation: state.reports.filter((r) => r.kind !== "message" && r.status === "open" && inScope(r.campusId)).length,
    requests: state.dataRequests.filter((r) => (r.status === "open" || r.status === "in_progress") && inScope(r.campusId)).length,
    dupes: findDuplicates(state.users).length,
    unmapped: unmappedValues(state).length,
    consent: state.users.filter((u) => u.role === "STU" && u.studentStatus === "awaiting_consent" && inScope(u.campusIds[0])).length,
    vouch: state.verifications.filter((v) => v.status === "pending" && v.campusId === me.campusIds[0] && v.passYear === me.batch && !v.vouches.some((x) => x.by === me.id)).length,
    jobs: state.jobs.filter((j) => j.status === "pending" && inScope(j.campusId)).length,
    docs: state.docRequests.filter((r) => r.status === "paid" && inScope(r.campusId)).length,
    intros: state.guideIntros.filter((r) => r.status === "requested" && inScope(r.campusId)).length,
    dms: state.dmThreads.filter((t) => {
      if (!t.members.includes(me.id)) return false;
      const last = state.dms.filter((m) => m.threadId === t.id).at(-1);
      return !!last && last.senderId !== me.id;
    }).length,
  };
  const nav = navFor(me, counts);

  const sidebar = (variant: "desktop" | "mobile") => (
    <div className="flex h-full flex-col">
      <div className="flex h-[var(--header-h)] items-center justify-between border-b border-border px-5">
        <Logo href="/portal" />
        <button className="grid h-9 w-9 place-items-center rounded-md hover:bg-surface-2 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-5 pb-1 pt-4">
        <div>
          <p className="truncate text-sm font-semibold">{roleLabels[me.role]}</p>
          <p className="truncate text-label text-muted">{scope ? (scope.length === 1 ? campusName(scope[0]) : `${scope.length} campuses`) : "All 39 campuses"}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-px overflow-y-auto px-3 py-2" aria-label="Portal">
        {nav.map((n) => {
          const heading = n.section ? (
            <p key={`s-${n.section}`} className="px-3 pb-1 pt-5 text-xs font-semibold uppercase tracking-[0.08em] text-subtle">
              {n.section}
            </p>
          ) : null;
          // trailingSlash export: pathname can be "/portal/"; compare without it
          const path = pathname.replace(/\/+$/, "") || "/";
          const active = n.href === "/portal" ? path === "/portal" : (path === n.href || path.startsWith(n.href + "/")) && n.href !== "#";
          if (n.soon)
            return (
              <div key={n.label} className="flex h-[var(--nav-item-h)] cursor-not-allowed items-center gap-3 rounded-[var(--nav-item-radius)] px-3 text-sm font-medium text-subtle" title="Arrives in a later prototype phase">
                <n.icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{n.label}</span>
                <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide">Soon</span>
              </div>
            );
          return [
            heading,
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "ds-interactive relative flex h-[var(--nav-item-h)] items-center gap-3 rounded-[var(--nav-item-radius)] px-3 text-sm font-medium",
                active ? "text-primary" : "text-muted hover:bg-surface-2 hover:text-text"
              )}
              aria-current={active ? "page" : undefined}
            >
              {active && (
                <motion.span
                  layoutId={`nav-active-${variant}`}
                  className="absolute inset-0 rounded-[var(--nav-item-radius)] bg-primary-soft"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <n.icon className="relative h-4 w-4 shrink-0" />
              <span className="relative flex-1 truncate">{n.label}</span>
              {!!n.count && <span className={cn("relative grid h-5 min-w-5 place-items-center rounded-[var(--radius-sm)] px-2 text-xs font-semibold tabular-nums", active ? "bg-primary text-primary-fg" : "bg-surface-3 text-text")}>{n.count}</span>}
            </Link>,
          ];
        })}
      </nav>
      <div className="space-y-px border-t border-border px-3 py-3">
        <Link href="/demo" className="flex h-[var(--nav-item-h)] items-center gap-3 rounded-[var(--nav-item-radius)] px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text">
          <PlayCircle className="h-4 w-4" />
          Guided tours
        </Link>
        <button
          onClick={() => {
            reset();
            router.push("/demo");
          }}
          className="flex h-[var(--nav-item-h)] w-full items-center gap-3 rounded-[var(--nav-item-radius)] px-3 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text"
        >
          <RotateCcw className="h-4 w-4" />
          Reset demo data
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[var(--sidebar-w)]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-w)] border-r border-border bg-surface lg:block">
        {sidebar("desktop")}
      </aside>
      {/* Mobile drawer */}
      <Drawer open={mobileNav} onClose={() => setMobileNav(false)} className="h-full w-[280px] max-w-[85vw] border-r border-border bg-surface">
        {sidebar("mobile")}
      </Drawer>

      <header className="sticky top-0 z-20 border-b border-border bg-surface">
        <div className="flex h-[var(--header-h)] items-center gap-2 px-4 sm:px-6">
          <button className="ds-interactive grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu" aria-expanded={mobileNav}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="lg:hidden">
            <Logo compact href="/portal" />
          </div>
          <div className="flex-1" />
          <RoleSwitcher />
          <ThemeToggle />
          <UserMenu
            me={me}
            onLogout={() => {
              logout();
              router.push("/");
            }}
          />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <PageTransition routeKey={pathname}>{children}</PageTransition>
      </main>
    </div>
  );
}

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOut();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

export function RoleSwitcher() {
  const { me, state, login } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 items-center gap-2 rounded-md border border-dashed border-border-strong px-3 text-label font-medium text-muted hover:bg-surface-2 hover:text-text"
      >
        <span className="hidden sm:inline">Demo ·</span> Switch role
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      <Dropdown open={open} className="absolute right-0 top-11 z-50 w-[300px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold">Switch persona</p>
            <p className="text-label text-muted">Demo only · real users sign in with OTP</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {personas.map((p) => {
              const u = state.users.find((x) => x.id === p.userId);
              if (!u) return null;
              return (
                <button
                  key={p.userId}
                  onClick={() => {
                    login(u.id);
                    setOpen(false);
                    router.push("/portal");
                  }}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-surface-2", me?.id === u.id && "bg-primary-soft")}
                >
                  <Avatar name={u.name} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold">{u.name}</span>
                    </span>
                    <span className="block truncate text-label text-muted">
                      {roleLabels[u.role]} · {p.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
      </Dropdown>
    </div>
  );
}

function UserMenu({ me, onLogout }: { me: User; onLogout: () => void }) {
  const { state, switchContext } = useStore();
  const router = useRouter();
  const linked = me.linkedUserId ? state.users.find((u) => u.id === me.linkedUserId && !u.deactivated) : undefined;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-2 sm:pr-2" aria-label="Account menu">
        <Avatar name={me.name} size={34} />
        <span className="hidden text-left md:block">
          <span className="block max-w-[140px] truncate text-sm font-semibold leading-tight">{me.name}</span>
          <span className="block text-xs leading-tight text-muted">{roleLabels[me.role]}</span>
        </span>
      </button>
      <Dropdown open={open} className="absolute right-0 top-12 z-50 w-60 rounded-xl border border-border bg-surface p-2 shadow-lg">
          <div className="px-3 py-3">
            <p className="truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-label text-muted">{me.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <Pill tone="primary">{roleLabels[me.role]}</Pill>
              {me.badges?.map((b) => (
                <Pill key={b.type} tone={b.status === "active" ? "success" : "danger"}>
                  {b.type}
                  {b.status === "suspended" && " · suspended"}
                </Pill>
              ))}
            </div>
          </div>
          {linked && (
            <button
              onClick={() => {
                setOpen(false);
                switchContext(linked.id);
                router.push("/portal");
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-surface-2"
            >
              <Repeat className="h-4 w-4" /> Switch to {roleLabels[linked.role]}
            </button>
          )}
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-2">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
      </Dropdown>
    </div>
  );
}
