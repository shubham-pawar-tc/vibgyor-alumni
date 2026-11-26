"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Compass, FileText, GraduationCap, Info, KeyRound, LogIn, Mail, MapPin, Menu, Moon, PlayCircle, ShieldCheck, Sun, UserPlus, X, type LucideIcon } from "lucide-react";
import { Button, Logo } from "./ui";
import { useStore } from "@/lib/store";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    setDark(attr ? attr === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("vaa-theme", next);
    } catch {}
    setDark(!dark);
  };
  return (
    <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-xl text-muted hover:bg-surface-2 hover:text-text" aria-label="Toggle dark mode">
      <span key={dark ? "sun" : "moon"} className="pop grid place-items-center">
        {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
      </span>
    </button>
  );
}

const links: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/#about", label: "About VAA", icon: Info },
  { href: "/#mentoring", label: "Mentoring", icon: GraduationCap },
  { href: "/#mycareerz", label: "MyCareerZ", icon: Compass },
  { href: "/enquiry", label: "Contact", icon: Mail },
  { href: "/demo", label: "Guided demo", icon: PlayCircle },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { me } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="spectrum-flow h-[3px]" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="group flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text">
              <l.icon className="icon-bounce h-4 w-4 opacity-70 group-hover:text-primary group-hover:opacity-100" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            {me ? (
              <Button href="/portal" size="sm">
                Open portal
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  <LogIn className="h-4 w-4" /> Log in
                </Button>
                <Button href="/join" size="sm">
                  <UserPlus className="h-4 w-4" /> Join as alumni
                </Button>
              </>
            )}
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-xl hover:bg-surface-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="animate-in border-t border-border bg-surface px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-surface-2">
              <l.icon className="h-[18px] w-[18px] text-primary" />
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button href="/login" variant="secondary">
              <LogIn className="h-4 w-4" /> Log in
            </Button>
            <Button href="/join">
              <UserPlus className="h-4 w-4" /> Join
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative mt-24 border-t border-border bg-surface">
      <div className="spectrum-flow absolute inset-x-0 top-0 h-1" />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
            The VIBGYOR Alumni Association connects former students from 39 campuses with each other and with the students who follow them.
          </p>
        </div>
        <div>
          <p className="mb-3 text-[14px] font-semibold">Platform</p>
          <ul className="space-y-2 text-[14px] text-muted">
            {[
              { href: "/join", label: "Join or claim your profile", icon: UserPlus },
              { href: "/login", label: "Parent login", icon: KeyRound },
              { href: "/enquiry", label: "Enquiry form", icon: Mail },
              { href: "/demo", label: "Demo guide", icon: BookOpen },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="group inline-flex items-center gap-2 transition-colors hover:text-text">
                  <l.icon className="h-3.5 w-3.5 text-primary/70 group-hover:text-primary" /> {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[14px] font-semibold">Privacy &amp; safety</p>
          <ul className="space-y-2 text-[14px] text-muted">
            <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-primary/70" /> Data stored in India (DPDP Act 2023)</li>
            <li className="flex items-center gap-2"><FileText className="h-3.5 w-3.5 text-primary/70" /> Grievance officer: [TBC]</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary/70" /> Safeguarding code of conduct</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[13px] text-muted sm:px-6">
          Prototype for RFQ v1.0 · sample data only · nothing is sent or stored outside your browser.
        </p>
      </div>
    </footer>
  );
}

/** Navy page-top band used by login, join and other public flows. Content below can overlap it with a negative margin. */
export function AuthBand({
  eyebrow,
  eyebrowIcon: EIcon,
  title,
  body,
  chips,
}: {
  eyebrow: string;
  eyebrowIcon: LucideIcon;
  title: React.ReactNode;
  body?: React.ReactNode;
  chips?: { icon: LucideIcon; label: string; color?: string }[];
}) {
  return (
    <section className="border-b border-border bg-surface pb-28 pt-12 sm:pt-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="enter enter-1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-muted shadow-card">
          <EIcon className="h-3.5 w-3.5 text-primary" /> {eyebrow}
        </p>
        <h1 className="enter enter-2 mt-5 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-[44px] sm:leading-[1.1]">{title}</h1>
        {body && <p className="enter enter-3 mt-4 max-w-xl text-[16px] leading-relaxed text-muted">{body}</p>}
        {chips && (
          <div className="enter enter-4 mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {chips.map((c) => (
              <span key={c.label} className="inline-flex items-center gap-2 text-[14px] font-medium text-muted">
                <c.icon className="h-4 w-4 text-primary" />
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
