"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized; plain <img> keeps basePath handling explicit */

import { ArrowRight, Lock } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Button } from "@/components/ui";
import { Emoji, photo, type EmojiName } from "@/components/Emoji";
import { Enter, EnterItem, Reveal } from "@/components/motion";
import { HomeSections } from "@/components/HomeSections";
import { Backdrop, LEAF, PillEyebrow, STICKER, Underlined } from "@/components/Funk";

const sticker = `absolute ${STICKER}`;

/* The landing page is one screen: headline, actions, a photo and the key figures.
   The rest of the page follows below the fold. */

const stats: { emoji: EmojiName; value: string; label: string }[] = [
  { emoji: "people", value: "4,650+", label: "Alumni" },
  { emoji: "school", value: "39", label: "Campuses" },
  { emoji: "globe", value: "24+", label: "Countries" },
  { emoji: "calendar", value: "2004", label: "First batch" },
];

const heroChips: { emoji: EmojiName; label: string }[] = [
  { emoji: "wave", label: "Reconnect" },
  { emoji: "handshake", label: "Mentor" },
  { emoji: "briefcase", label: "Hire" },
  { emoji: "hug", label: "Reunite" },
];

/** Big hero photo in a leaf-shaped frame, with a second photo and tilted stickers. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[680px] px-3 pb-10 pt-6 sm:px-6">
      <Backdrop />

      {/* main photo */}
      <div className={`relative overflow-hidden ${LEAF} shadow-lg ring-1 ring-black/5`}>
        <img
          src={photo("hero-graduation")}
          alt="Graduates throwing their caps in the air"
          className="aspect-[4/3] w-full object-cover lg:h-[min(62svh,560px)] lg:aspect-auto"
          fetchPriority="high"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
      </div>

      {/* second photo: round, overlapping bottom-left */}
      <div className="absolute -bottom-1 left-0 h-28 w-28 -rotate-6 overflow-hidden rounded-full border-4 border-surface shadow-lg sm:h-36 sm:w-36">
        <img src={photo("alumni-reunion")} alt="Friends with arms around each other" className="h-full w-full object-cover" />
      </div>

      {/* sticker: alumni count */}
      <div className={`${sticker} left-0 top-2 flex -rotate-3 items-center gap-3 px-4 py-3 sm:-left-2`}>
        <Emoji name="people" size={36} />
        <div>
          <p className="font-display text-xl font-semibold leading-none tabular-nums">4,650+</p>
          <p className="mt-1 text-xs text-muted">alumni already here</p>
        </div>
      </div>

      {/* emoji stickers */}
      <span className={`${sticker} right-6 top-0 grid h-14 w-14 rotate-12 place-items-center rounded-full sm:h-16 sm:w-16`}>
        <Emoji name="graduation-cap" size={34} />
      </span>
      <span className={`${sticker} -right-1 top-1/2 hidden h-12 w-12 -rotate-12 place-items-center rounded-full sm:grid`}>
        <Emoji name="party" size={28} />
      </span>
      <span className={`${sticker} bottom-24 left-24 hidden h-11 w-11 rotate-6 place-items-center rounded-full sm:left-32 sm:grid`}>
        <Emoji name="heart" size={24} />
      </span>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="flex flex-col overflow-hidden border-b border-border bg-surface lg:min-h-[calc(100svh-var(--header-h))]">
        <div className="container-page grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-10 lg:py-8">
          <Enter>
            <EnterItem>
              <PillEyebrow emoji="school">VIBGYOR Alumni Association</PillEyebrow>
            </EnterItem>
            <EnterItem as="h1" className="mt-5 text-4xl font-semibold sm:text-5xl lg:text-[3.5rem] lg:leading-[1.08]">
              One VIBGYOR.
              <br />
              <Underlined>Every generation.</Underlined>
            </EnterItem>
            <EnterItem className="mt-8 flex flex-wrap gap-2">
              {heroChips.map((c, i) => (
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
            <EnterItem className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/join" size="lg">
                Join or claim your profile <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/login" size="lg" variant="secondary">
                Student &amp; parent login
              </Button>
            </EnterItem>
            <EnterItem as="p" className="mt-6 flex items-center gap-2 text-sm text-muted">
              <Lock className="h-3.5 w-3.5" /> Data stored in India · DPDP Act 2023
            </EnterItem>
          </Enter>
          <Reveal delay={150}>
            <HeroVisual />
          </Reveal>
        </div>

        {/* Key figures */}
        <div className="border-t border-border">
          <dl className="container-page grid grid-cols-2 gap-y-6 py-6 md:grid-cols-4">
            {stats.map((st) => (
              <div key={st.label} className="flex items-center gap-3">
                <Emoji name={st.emoji} size={44} />
                <div>
                  <dd className="font-display text-2xl font-semibold leading-none tabular-nums">{st.value}</dd>
                  <dt className="mt-1 text-label text-muted">{st.label}</dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <HomeSections />

      <PublicFooter />
    </>
  );
}
