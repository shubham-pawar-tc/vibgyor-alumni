"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X, type LucideIcon } from "lucide-react";
import { Button, Logo } from "./ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Dropdown, Enter, EnterItem } from "./motion";

export { ThemeToggle };

const links: { href: string; label: string }[] = [
  { href: "/#about", label: "About" },
  { href: "/#safeguarding", label: "Safeguarding" },
  { href: "/#mycareerz", label: "MyCareerZ" },
  { href: "/enquiry", label: "Contact" },
  { href: "/demo", label: "Guided demo" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { me } = useStore();
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface">
      <div className="container-page flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo />
        <nav className="hidden flex-1 items-center gap-1 md:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "ds-interactive rounded-lg px-3 py-2 text-sm font-medium hover:bg-surface-2 hover:text-text",
                pathname === l.href ? "text-text" : "text-muted"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden items-center gap-2 sm:flex">
            {me ? (
              <Button href="/portal" size="sm">
                Open portal
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/join" size="sm">
                  Join as alumni
                </Button>
              </>
            )}
          </div>
          <button className="ds-interactive grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <Dropdown open={open} origin="top center" className="border-t border-border bg-surface px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="ds-interactive block rounded-lg px-3 py-3 text-body font-medium hover:bg-surface-2">
              {l.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
            <Button href="/login" variant="secondary">
              <LogIn className="h-4 w-4" /> Log in
            </Button>
            <Button href="/join">Join</Button>
          </div>
      </Dropdown>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            The VIBGYOR Alumni Association connects former students from 39 campuses with each other and with the students who follow them.
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Platform</p>
          <ul className="space-y-3 text-sm">
            {[
              { href: "/join", label: "Join or claim your profile" },
              { href: "/login", label: "Student & parent login" },
              { href: "/enquiry", label: "Enquiry form" },
              { href: "/demo", label: "Demo guide" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="ds-interactive text-muted hover:text-text">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Privacy &amp; safety</p>
          <ul className="space-y-3 text-sm text-muted">
            <li>Data stored in India (DPDP Act 2023)</li>
            <li>Grievance officer: [TBC]</li>
            <li>Safeguarding code of conduct</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="container-page py-4 text-label text-muted">Prototype for RFQ v1.0 · sample data only · nothing is sent or stored outside your browser.</p>
      </div>
    </footer>
  );
}

/** Page-top band used by login, join and other public flows. Content below can overlap it with a negative margin. */
export function AuthBand({
  eyebrow,
  title,
  body,
  chips,
}: {
  eyebrow: string;
  eyebrowIcon?: LucideIcon;
  title: React.ReactNode;
  body?: React.ReactNode;
  chips?: { icon: LucideIcon; label: string; color?: string }[];
}) {
  return (
    <section className="border-b border-border bg-surface pb-28 pt-12 sm:pt-14">
      <Enter className="container-page">
        <EnterItem as="p" className="eyebrow">{eyebrow}</EnterItem>
        <EnterItem as="h1" className="mt-3 max-w-2xl text-3xl font-semibold sm:text-4xl">{title}</EnterItem>
        {body && <EnterItem as="p" className="mt-4 max-w-xl text-base text-muted">{body}</EnterItem>}
        {chips && (
          <EnterItem><ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
            {chips.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-2 text-sm text-muted">
                <c.icon className="h-4 w-4 text-accent-strong" />
                {c.label}
              </li>
            ))}
          </ul></EnterItem>
        )}
      </Enter>
    </section>
  );
}
