"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized */

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { Button, Logo } from "./ui";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Dropdown, Enter, EnterItem, Reveal } from "./motion";
import { Emoji, photo as photoUrl, type EmojiName } from "./Emoji";
import { Backdrop, EmojiSticker, LEAF, PillEyebrow } from "./Funk";

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

/** Page-top band for public flows (join): pill eyebrow, big title, emoji chips and a leaf-framed photo.
 *  Content below can overlap the bottom of the band with a negative margin. */
export function AuthBand({
  eyebrow,
  emoji = "sparkles",
  title,
  body,
  chips,
  image,
  stickers = [],
}: {
  eyebrow: string;
  emoji?: EmojiName;
  title: React.ReactNode;
  body?: React.ReactNode;
  chips?: { emoji: EmojiName; label: string }[];
  /** File name in public/images/photos, without extension. */
  image?: string;
  stickers?: EmojiName[];
}) {
  return (
    <section className="overflow-hidden border-b border-border bg-surface pb-28 pt-10 sm:pt-12">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <Enter>
          <EnterItem>
            <PillEyebrow emoji={emoji}>{eyebrow}</PillEyebrow>
          </EnterItem>
          <EnterItem as="h1" className="mt-5 max-w-2xl text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.12]">{title}</EnterItem>
          {body && <EnterItem as="p" className="mt-5 max-w-xl text-base text-muted">{body}</EnterItem>}
          {chips && (
            <EnterItem className="mt-6 flex flex-wrap gap-2">
              {chips.map((c, i) => (
                <span
                  key={c.label}
                  className={`inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-2 pr-3.5 text-sm font-medium shadow-xs transition-transform duration-200 hover:-translate-y-0.5 hover:rotate-0 ${
                    i % 2 ? "rotate-1" : "-rotate-1"
                  }`}
                >
                  <Emoji name={c.emoji} size={22} /> {c.label}
                </span>
              ))}
            </EnterItem>
          )}
        </Enter>
        {image && (
          <Reveal delay={120} className="relative mx-auto hidden w-full max-w-[460px] px-4 pt-4 lg:block">
            <Backdrop />
            <div className={`relative overflow-hidden ${LEAF} shadow-lg ring-1 ring-black/5`}>
              <img src={photoUrl(image)} alt="" className="aspect-[5/3.6] w-full object-cover" />
            </div>
            {stickers[0] && <EmojiSticker name={stickers[0]} size={34} className="absolute left-0 top-0 -rotate-12" />}
            {stickers[1] && <EmojiSticker name={stickers[1]} size={30} className="absolute -right-1 top-1/2 rotate-12" />}
            {stickers[2] && <EmojiSticker name={stickers[2]} size={26} className="absolute -bottom-3 left-1/3 rotate-6" />}
          </Reveal>
        )}
      </div>
    </section>
  );
}
