"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
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
    <button onClick={toggle} className="grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text" aria-label="Toggle dark mode">
      {dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
    </button>
  );
}

const links = [
  { href: "/#about", label: "About VAA" },
  { href: "/#mentoring", label: "Mentoring" },
  { href: "/#mycareerz", label: "MyCareerZ" },
  { href: "/enquiry", label: "Contact" },
  { href: "/demo", label: "Guided demo" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { me } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/85 backdrop-blur-md">
      <div className="spectrum h-[3px]" />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-text">
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
                  Log in
                </Button>
                <Button href="/join" size="sm">
                  Join as alumni
                </Button>
              </>
            )}
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-surface px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-surface-2">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button href="/login" variant="secondary">
              Log in
            </Button>
            <Button href="/join">Join as alumni</Button>
          </div>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-muted">
            The VIBGYOR Alumni Association connects former students from 39 campuses with each other and with the students who follow them.
          </p>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Platform</p>
          <ul className="space-y-2 text-[13px] text-muted">
            <li><Link href="/join" className="hover:text-text">Join or claim your profile</Link></li>
            <li><Link href="/login" className="hover:text-text">Parent login</Link></li>
            <li><Link href="/enquiry" className="hover:text-text">Enquiry form</Link></li>
            <li><Link href="/demo" className="hover:text-text">Demo guide</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-[13px] font-semibold">Privacy &amp; safety</p>
          <ul className="space-y-2 text-[13px] text-muted">
            <li>Data stored in India (DPDP Act 2023)</li>
            <li>Grievance officer: [TBC]</li>
            <li>Safeguarding code of conduct</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-[12px] text-muted sm:px-6">
          Prototype for RFQ v1.0 · sample data only · nothing is sent or stored outside your browser.
        </p>
      </div>
    </footer>
  );
}
