"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized; plain <img> keeps basePath handling explicit */

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Avatar, Button } from "@/components/ui";
import { Emoji, photo, type EmojiName } from "@/components/Emoji";
import { Backdrop, EmojiSticker, FunkTitle, LEAF, STICKER, Underlined } from "@/components/Funk";
import { campuses } from "@/lib/data";
import { Reveal } from "@/components/motion";

type AudiencePoint = { emoji: EmojiName; label: string; desc: string };

const audiences: { emoji: EmojiName; title: string; img: string; tilt: string; points: AudiencePoint[] }[] = [
  {
    emoji: "graduation-cap",
    title: "Alumni",
    img: "alumni-reunion",
    tilt: "md:-rotate-1",
    points: [
      { emoji: "search", label: "Find batchmates", desc: "Search by name, campus, batch, city or company. Only verified alumni appear." },
      { emoji: "briefcase", label: "Jobs & referrals", desc: "Post openings, refer juniors and see roles shared by fellow VIBGYORites." },
      { emoji: "handshake", label: "Mentor students", desc: "Earn the Mentor badge, sign the safeguarding code and guide Class 8–12 students." },
    ],
  },
  {
    emoji: "backpack",
    title: "Students",
    img: "students-class",
    tilt: "md:translate-y-4",
    points: [
      { emoji: "compass", label: "Career guidance", desc: "Ask vetted alumni about the courses, colleges and countries they chose." },
      { emoji: "video", label: "Mentor videos", desc: "Short guidance videos recorded by alumni and approved by the school." },
      { emoji: "rocket", label: "Internships", desc: "Internships offered by alumni, each one approved by your school." },
    ],
  },
  {
    emoji: "family",
    title: "Parents",
    img: "parents-family",
    tilt: "md:rotate-1",
    points: [
      { emoji: "phone", label: "OTP consent", desc: "Your child’s account opens only after you confirm with an OTP on your school-registered mobile." },
      { emoji: "clipboard", label: "See permissions", desc: "One screen shows everything your child is allowed to do on the platform." },
      { emoji: "lock", label: "Withdraw anytime", desc: "Switch any permission off in one tap. It takes effect immediately." },
    ],
  },
];

const safeguards: { emoji: EmojiName; title: string }[] = [
  { emoji: "phone", title: "Parent OTP consent" },
  { emoji: "check", title: "Vetted mentors only" },
  { emoji: "chat", title: "Every chat recorded" },
  { emoji: "hidden", title: "Contacts auto-hidden" },
];

const steps: { emoji: EmojiName; title: string; caption: string; tilt: string }[] = [
  { emoji: "search", title: "Find", caption: "Your profile", tilt: "-rotate-6" },
  { emoji: "check", title: "Verify", caption: "Within a day", tilt: "rotate-3" },
  { emoji: "party", title: "Reconnect", caption: "Batch, jobs, reunions", tilt: "-rotate-3" },
];

const programmes: { emoji: EmojiName; name: string; who: string; img: string }[] = [
  { emoji: "brain", name: "Career Assessment", who: "Class 8–12", img: "prog-assessment" },
  { emoji: "rocket", name: "Junior MBA", who: "Class 9–12", img: "prog-juniormba" },
  { emoji: "books", name: "SAT / AP Prep", who: "Class 10–12", img: "prog-sat" },
  { emoji: "airplane", name: "Study Abroad", who: "Parents & students", img: "prog-abroad" },
];

const cities = [...new Set(campuses.map((c) => c.city))];

const faces = ["Priya Sharma", "Rohan Gupta", "Kabir Rao", "Ananya Desai"];

/** Points that open a one-line description on click (one open at a time per card). */
function PointList({ points }: { points: AudiencePoint[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <ul className="mt-4 space-y-2">
      {points.map((p) => {
        const isOpen = open === p.label;
        const id = `pt-${p.label.replace(/\W+/g, "-").toLowerCase()}`;
        return (
          <li key={p.label} className={`rounded-xl transition-colors duration-200 ${isOpen ? "bg-accent-soft" : "bg-bg"}`}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={id}
              onClick={() => setOpen(isOpen ? null : p.label)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-body transition-colors hover:bg-surface-2/60"
            >
              <Emoji name={p.emoji} size={24} />
              <span className="flex-1 font-medium">{p.label}</span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
            </button>
            <div
              id={id}
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-[var(--ease-natural)] ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <p className="overflow-hidden px-3 pl-12 text-sm leading-relaxed text-muted">
                <span className="block pb-3">{p.desc}</span>
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** Masked chat bubble: shows the safeguarding rule instead of describing it. */
function MaskedChat() {
  return (
    <div className={`${STICKER} w-[min(100%,20rem)] rotate-2 p-4 text-text`}>
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Emoji name="chat" size={18} /> Mentor chat · recorded
        </span>
        <Emoji name="shield" size={20} />
      </div>
      <div className="mt-3 space-y-2 text-sm">
        <p className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-surface-2 px-3 py-2">Which colleges for design?</p>
        <p className="ml-auto w-fit max-w-[90%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-primary-fg">
          Call me on <span className="whitespace-nowrap rounded bg-white/20 px-1 font-mono tracking-wider">98•• ••• •••</span>
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Emoji name="hidden" size={18} /> Number hidden automatically
        </p>
      </div>
    </div>
  );
}

/** Landing-page sections below the hero (the hero fills the first screen). */
export function HomeSections() {
  return (
    <>
      {/* Audiences */}
      <section id="about" className="section-y relative scroll-mt-20 overflow-hidden">
        <Reveal className="container-page">
          <FunkTitle center emoji="sparkles" eyebrow="Who it's for" title="Built for every VIBGYORite" mark="every VIBGYORite" />
          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {audiences.map((a) => (
              <div
                key={a.title}
                className={`group overflow-hidden rounded-[1.75rem] rounded-tr-[4rem] border border-border bg-surface shadow-md transition-transform duration-300 hover:-translate-y-1 hover:rotate-0 ${a.tilt}`}
              >
                <div className="overflow-hidden">
                  <img src={photo(a.img)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="relative px-5 pb-5 pt-10">
                  <span className="absolute -top-9 left-5 grid h-[4.5rem] w-[4.5rem] -rotate-6 place-items-center rounded-2xl border border-border bg-surface shadow-lg transition-transform duration-300 group-hover:rotate-0">
                    <Emoji name={a.emoji} size={44} />
                  </span>
                  <h3 className="text-xl font-semibold">{a.title}</h3>
                  <PointList points={a.points} />
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Safeguarding */}
      <section id="safeguarding" className="section-y scroll-mt-20 overflow-hidden bg-navy text-white">
        <Reveal className="container-page grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="relative pb-12 pr-4 pt-4 sm:pr-10">
            <Backdrop dots="left" invert />
            <div className={`relative overflow-hidden ${LEAF} shadow-lg`}>
              <img src={photo("safe-kids")} alt="Young students walking to school with backpacks" loading="lazy" className="aspect-[4/3] w-full object-cover" />
            </div>
            <EmojiSticker name="shield" size={34} className="absolute left-2 top-0 -rotate-12" />
            <div className="absolute bottom-0 right-0">
              <MaskedChat />
            </div>
          </div>
          <div>
            <FunkTitle invert emoji="shield" eyebrow="Safeguarding" title="Safe for children, by design" mark="by design" />
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {safeguards.map((s, i) => (
                <li
                  key={s.title}
                  className={`flex flex-col gap-3 rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-0.5 hover:rotate-0 ${
                    i % 2 ? "rotate-1" : "-rotate-1"
                  }`}
                >
                  <Emoji name={s.emoji} size={42} />
                  <span className="text-body font-semibold leading-snug">{s.title}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/demo"
              className="mt-8 inline-flex h-[var(--btn-h-lg)] items-center gap-2 rounded-[var(--btn-radius)] bg-white px-5 text-body font-semibold text-[#172b4d] transition-colors hover:bg-white/90"
            >
              See the safety demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="section-y border-b border-border bg-surface">
        <Reveal className="container-page">
          <FunkTitle center emoji="point" eyebrow="How it works" title="Back with your batch in 3 steps" mark="3 steps" />
          <div className="relative mt-16">
            <svg
              aria-hidden
              className="absolute left-[16.6%] right-[16.6%] top-6 hidden h-10 w-[66.8%] text-border-strong md:block"
              viewBox="0 0 600 40"
              preserveAspectRatio="none"
            >
              <path d="M0 20 C 100 -5, 200 45, 300 20 S 500 -5, 600 20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" />
            </svg>
            <ol className="relative grid gap-10 md:grid-cols-3">
              {steps.map((st, i) => (
                <li key={st.title} className="group flex flex-col items-center text-center">
                  <span
                    className={`relative grid h-24 w-24 place-items-center rounded-[1.75rem] border border-border bg-bg shadow-md ring-8 ring-surface transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105 ${st.tilt}`}
                  >
                    <Emoji name={st.emoji} size={52} />
                    <span className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-primary text-sm font-bold text-primary-fg">{i + 1}</span>
                  </span>
                  <p className="mt-5 text-lg font-semibold">{st.title}</p>
                  <p className="text-sm text-muted">{st.caption}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Campus footprint */}
          <div className="relative mt-20">
            <div className={`relative overflow-hidden ${LEAF}`}>
              <img src={photo("campus-building")} alt="A school campus building" loading="lazy" className="h-72 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d1a30]/90 via-[#0d1a30]/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-10">
                <p className="font-display text-2xl font-semibold sm:text-3xl">
                  <Underlined>39 campuses</Underlined> · {cities.length} cities
                </p>
                <div className="mt-4 flex max-w-3xl flex-wrap gap-1.5">
                  {cities.map((c) => (
                    <span key={c} className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs backdrop-blur-sm">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <EmojiSticker name="pin" size={36} className="absolute -top-5 right-10 rotate-12" />
          </div>
        </Reveal>
      </section>

      {/* MyCareerZ */}
      <section id="mycareerz" className="section-y scroll-mt-20">
        <Reveal className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <FunkTitle emoji="bulb" eyebrow="MyCareerZ × OSEHub" title="Career programmes for families" mark="families" />
            <Button href="/enquiry?topic=mycareerz" variant="secondary" className="shrink-0">
              Ask MyCareerZ <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {programmes.map((p, i) => (
              <Link
                key={p.name}
                href="/enquiry?topic=mycareerz"
                className={`group flex flex-col overflow-hidden rounded-[1.5rem] border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:rotate-0 hover:shadow-lg ${
                  i % 2 ? "lg:rotate-1" : "lg:-rotate-1"
                } ${i % 2 ? "rounded-tl-[3rem]" : "rounded-tr-[3rem]"}`}
              >
                <div className="overflow-hidden">
                  <img src={photo(p.img)} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div className="relative flex flex-1 flex-col px-4 pb-4 pt-9">
                  <span className="absolute -top-7 left-4 grid h-14 w-14 -rotate-6 place-items-center rounded-2xl border border-border bg-surface shadow-md transition-transform duration-300 group-hover:rotate-0">
                    <Emoji name={p.emoji} size={34} />
                  </span>
                  <span className="text-body font-semibold">{p.name}</span>
                  <span className="mt-0.5 text-label text-muted">{p.who}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-link">
                    Enquire <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Closing call to action */}
      <section className="container-page">
        <div className="relative">
          <div className={`relative overflow-hidden ${LEAF}`}>
            <img src={photo("cta-friends")} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d1a30]/90 via-[#0d1a30]/70 to-[#0d1a30]/30" />
            <div className="relative flex flex-col items-start gap-6 px-6 py-14 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex -space-x-2">
                  {faces.map((n) => (
                    <span key={n} className="rounded-full ring-2 ring-white/80">
                      <Avatar name={n} size={40} />
                    </span>
                  ))}
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white ring-2 ring-white/80">
                    <Emoji name="heart" size={24} />
                  </span>
                </div>
                <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
                  Your batch is <Underlined>already here.</Underlined>
                </h2>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  href="/join"
                  className="inline-flex h-[var(--btn-h-lg)] items-center justify-center gap-2 rounded-[var(--btn-radius)] bg-white px-5 text-body font-semibold text-[#172b4d] transition-colors hover:bg-white/90"
                >
                  Claim my profile <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex h-[var(--btn-h-lg)] items-center justify-center rounded-[var(--btn-radius)] px-5 text-body font-semibold text-white ring-1 ring-white/50 transition-colors hover:bg-white/10"
                >
                  Guided demo
                </Link>
              </div>
            </div>
          </div>
          <EmojiSticker name="party" size={34} className="absolute -top-5 right-8 rotate-12" />
        </div>
        <p className="mt-3 text-xs text-subtle">Photos are stock placeholders, not VIBGYOR students.</p>
      </section>
    </>
  );
}
