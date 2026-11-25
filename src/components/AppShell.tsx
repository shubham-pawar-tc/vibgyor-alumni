"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
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
import { Avatar, Logo, Pill } from "./ui";
import { ThemeToggle } from "./Public";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Home;
  count?: number;
  soon?: boolean;
}

function navFor(me: User, counts: { verif: number; reports: number; consent: number; vouch: number; jobs: number; dms: number }): NavItem[] {
  const home: NavItem = { href: "/portal", label: "Home", icon: Home };
  switch (me.role) {
    case "STU":
      return [
        home,
        { href: "/portal/mentors", label: "Find a mentor", icon: Search },
        { href: "/portal/messages", label: "Messages", icon: MessagesSquare },
        { href: "/portal/jobs", label: "Internships", icon: Briefcase },
        { href: "/portal/events", label: "Events", icon: CalendarDays },
        { href: "/portal/profile", label: "My profile", icon: UserRound },
      ];
    case "PAR":
      return [home, { href: "/portal/consent", label: "Consent centre", icon: ShieldCheck }, { href: "/portal/events", label: "Events", icon: CalendarDays }];
    case "ALP":
      return [home, { href: "/portal/profile", label: "My profile", icon: UserRound }, { href: "/portal/directory", label: "Alumni directory", icon: Lock }];
    case "ALU":
      return [
        home,
        { href: "/portal/profile", label: "My profile", icon: UserRound },
        { href: "/portal/directory", label: "Alumni directory", icon: Users },
        { href: "/portal/groups", label: "Batch groups", icon: UsersRound },
        { href: "/portal/chats", label: "Chats", icon: MessageCircle, count: counts.dms },
        { href: "/portal/jobs", label: "Jobs", icon: Briefcase },
        { href: "/portal/events", label: "Events", icon: CalendarDays },
        { href: "/portal/invite", label: "Invite friends", icon: Send },
        ...(me.badges?.some((b) => b.type === "Mentor") ? [{ href: "/portal/messages", label: "Mentor inbox", icon: MessagesSquare }] : []),
        { href: "/portal/vouch", label: "Vouch for batchmates", icon: HeartHandshake, count: counts.vouch },
        { href: "/portal/mentor", label: activeBadge(me, "Mentor") ? "Mentor badge" : "Become a mentor", icon: GraduationCap },
      ];
    case "CAD":
    case "GAO":
    case "SAD":
      return [
        { href: "/portal", label: "Dashboard", icon: Home },
        { href: "/portal/admin/verification", label: "Verification", icon: BadgeCheck, count: counts.verif },
        { href: "/portal/admin/safeguarding", label: "Safeguarding", icon: ShieldAlert, count: counts.reports },
        { href: "/portal/admin/consents", label: "Student consents", icon: ClipboardCheck, count: counts.consent },
        { href: "/portal/admin/broadcast", label: "Broadcasts", icon: Megaphone },
        { href: "/portal/admin/content", label: "Jobs & events", icon: CalendarCheck, count: counts.jobs },
        { href: "/portal/admin/audit", label: "Audit log", icon: FileClock },
        ...(me.role === "SAD" ? [{ href: "/portal/admin/settings", label: "Settings", icon: Settings }] : []),
      ];
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
      <div className="grid min-h-screen place-items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const scope = me.role === "GAO" || me.role === "SAD" ? null : me.campusIds;
  const inScope = (cid: string) => !scope || scope.includes(cid);
  const counts = {
    verif: state.verifications.filter((v) => v.status === "pending" && inScope(v.campusId)).length + state.badgeRequests.filter((b) => b.status === "pending" && inScope(b.campusId)).length,
    reports: state.reports.filter((r) => r.status === "open" && inScope(r.campusId)).length,
    consent: state.users.filter((u) => u.role === "STU" && u.studentStatus === "awaiting_consent" && inScope(u.campusIds[0])).length,
    vouch: state.verifications.filter((v) => v.status === "pending" && v.campusId === me.campusIds[0] && v.passYear === me.batch && !v.vouches.some((x) => x.by === me.id)).length,
    jobs: state.jobs.filter((j) => j.status === "pending" && inScope(j.campusId)).length,
    dms: state.dmThreads.filter((t) => {
      if (!t.members.includes(me.id)) return false;
      const last = state.dms.filter((m) => m.threadId === t.id).at(-1);
      return !!last && last.senderId !== me.id;
    }).length,
  };
  const nav = navFor(me, counts);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between px-5">
        <Logo href="/portal" />
        <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 lg:hidden" onClick={() => setMobileNav(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-4 pb-2">
        <div className="rounded-xl bg-surface-2 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Signed in as</p>
          <p className="mt-0.5 truncate text-[13px] font-semibold">{roleLabels[me.role]}</p>
          <p className="truncate text-[12px] text-muted">{scope ? (scope.length === 1 ? campusName(scope[0]) : `${scope.length} campuses`) : "All 39 campuses"}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {nav.map((n) => {
          const active = n.href === "/portal" ? pathname === "/portal" : pathname.startsWith(n.href) && n.href !== "#";
          if (n.soon)
            return (
              <div key={n.label} className="flex h-10 cursor-not-allowed items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-muted/60" title="Arrives in a later prototype phase">
                <n.icon className="h-[18px] w-[18px]" />
                <span className="flex-1">{n.label}</span>
                <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Soon</span>
              </div>
            );
          return (
            <Link
              key={n.label}
              href={n.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors",
                active ? "bg-primary-soft text-primary" : "text-text/80 hover:bg-surface-2 hover:text-text"
              )}
            >
              <n.icon className="h-[18px] w-[18px]" />
              <span className="flex-1">{n.label}</span>
              {!!n.count && <span className={cn("grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-bold tabular-nums", active ? "bg-primary text-primary-fg" : "bg-danger text-white")}>{n.count}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="space-y-0.5 border-t border-border px-3 py-3">
        <Link href="/demo" className="flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-text/80 hover:bg-surface-2">
          <PlayCircle className="h-[18px] w-[18px]" />
          Guided tours
        </Link>
        <button
          onClick={() => {
            reset();
            router.push("/demo");
          }}
          className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-text/80 hover:bg-surface-2"
        >
          <RotateCcw className="h-[18px] w-[18px]" />
          Reset demo data
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-[264px]">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] border-r border-border bg-surface lg:block">
        <div className="spectrum absolute inset-x-0 top-0 h-[3px]" />
        {sidebar}
      </aside>
      {/* Mobile drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileNav(false)}>
          <aside className="animate-in h-full w-[280px] max-w-[85vw] bg-surface" onClick={(e) => e.stopPropagation()}>
            {sidebar}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-20 border-b border-border bg-surface/85 backdrop-blur-md">
        <div className="spectrum h-[3px] lg:hidden" />
        <div className="flex h-16 items-center gap-2 px-4 sm:px-6">
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 lg:hidden" onClick={() => setMobileNav(true)} aria-label="Open menu">
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
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
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
        className="flex h-9 items-center gap-2 rounded-lg border border-dashed border-primary/50 bg-primary-soft/60 px-2.5 text-[12.5px] font-semibold text-primary hover:bg-primary-soft"
      >
        <span className="hidden sm:inline">Demo:</span> Switch role
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="animate-in absolute right-0 top-11 z-50 w-[300px] max-w-[calc(100vw-32px)] overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="border-b border-border px-4 py-3">
            <p className="text-[13px] font-semibold">Switch persona</p>
            <p className="text-[12px] text-muted">Demo only · real users sign in with OTP</p>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-1.5">
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
                  className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-surface-2", me?.id === u.id && "bg-primary-soft")}
                >
                  <Avatar name={u.name} size={32} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold">{u.name}</span>
                    </span>
                    <span className="block truncate text-[11.5px] text-muted">
                      {roleLabels[u.role]} · {p.blurb}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function UserMenu({ me, onLogout }: { me: User; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-full p-0.5 hover:bg-surface-2 sm:pr-2" aria-label="Account menu">
        <Avatar name={me.name} size={34} />
        <span className="hidden text-left md:block">
          <span className="block max-w-[140px] truncate text-[13px] font-semibold leading-tight">{me.name}</span>
          <span className="block text-[11px] leading-tight text-muted">{roleLabels[me.role]}</span>
        </span>
      </button>
      {open && (
        <div className="animate-in absolute right-0 top-12 z-50 w-60 rounded-2xl border border-border bg-surface p-1.5 shadow-2xl">
          <div className="px-3 py-2.5">
            <p className="truncate text-[13px] font-semibold">{me.name}</p>
            <p className="truncate text-[12px] text-muted">{me.email}</p>
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
          <button onClick={onLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium hover:bg-surface-2">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
