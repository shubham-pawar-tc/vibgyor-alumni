"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized */

import { ArrowRight, ChevronRight } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { useTour } from "@/components/Tour";
import { Avatar, Button, Card } from "@/components/ui";
import { tours } from "@/lib/tours";
import { Emoji, photo, type EmojiName } from "@/components/Emoji";
import { Backdrop, EmojiSticker, LEAF, PillEyebrow, Underlined } from "@/components/Funk";

/* Each flow as a simple chain: who → does what */
const flows: { tourId: number; emoji: EmojiName; chain: { who: string; role: string; does: string }[]; result: string }[] = [
  {
    tourId: 1,
    emoji: "family",
    chain: [
      { who: "Aarav Mehta", role: "Student", does: "Account is locked" },
      { who: "Neha Mehta", role: "Parent", does: "Gets SMS, enters code" },
      { who: "Neha Mehta", role: "Parent", does: "Chooses permissions" },
      { who: "Aarav Mehta", role: "Student", does: "Account opens" },
    ],
    result: "No child uses the platform without a parent's verified yes. Parents can switch it off any time.",
  },
  {
    tourId: 2,
    emoji: "chat",
    chain: [
      { who: "Diya Iyer", role: "Student", does: "Sees approved mentors only" },
      { who: "Diya Iyer", role: "Student", does: "Sends a question" },
      { who: "System", role: "Automatic", does: "Hides phone / email" },
      { who: "Meera Joshi", role: "School staff", does: "Reviews & can suspend" },
    ],
    result: "Students only talk to vetted mentors, inside the platform, with the school watching.",
  },
  {
    tourId: 3,
    emoji: "graduation-cap",
    chain: [
      { who: "Karan Malhotra", role: "Former student", does: "Signs up" },
      { who: "System", role: "Automatic", does: "Checks school records" },
      { who: "Meera Joshi", role: "School staff", does: "Checks the unclear ones" },
      { who: "Rohan Gupta", role: "Batchmate", does: "Vouches for old batches" },
    ],
    result: "Only real VIBGYOR alumni get in, so students are safe.",
  },
  {
    tourId: 4,
    emoji: "megaphone",
    chain: [
      { who: "Meera Joshi", role: "School staff", does: "Picks who to message" },
      { who: "System", role: "Automatic", does: "Removes opt-outs" },
      { who: "Meera Joshi", role: "School staff", does: "Sends email / WhatsApp" },
      { who: "Sanjay Verma", role: "Head office", does: "Sees all campuses + log" },
    ],
    result: "One place to reach alumni on every channel, respecting their choices.",
  },
];

const people = [
  { name: "Aarav Mehta", role: "Student, Class 11", note: "Waiting for parent" },
  { name: "Diya Iyer", role: "Student, Class 12", note: "Can talk to mentors" },
  { name: "Neha Mehta", role: "Parent", note: "Aarav's mother" },
  { name: "Priya Sharma", role: "Alumni mentor", note: "Imperial College London" },
  { name: "Rohan Gupta", role: "Alumni", note: "Batch 2006" },
  { name: "Meera Joshi", role: "School staff", note: "Malad campus admin" },
  { name: "Sanjay Verma", role: "Head office", note: "All 39 campuses" },
];

export default function DemoPage() {
  const { start } = useTour();

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Intro */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="max-w-2xl">
            <PillEyebrow emoji="play">Guided demo</PillEyebrow>
            <h1 className="mt-5 text-3xl font-semibold sm:text-[2.75rem] sm:leading-[1.12]">
              See how the <Underlined>platform works</Underlined>
            </h1>
            <p className="mt-4 text-body leading-relaxed text-muted">
              Pick a story and press <b className="text-text">Start tour</b>. A guide box tells you what to click. No login needed.
            </p>
          </div>
          <div className="relative mx-auto hidden w-full max-w-[420px] px-3 pt-3 lg:block">
            <Backdrop />
            <div className={`relative overflow-hidden ${LEAF} shadow-lg ring-1 ring-black/5`}>
              <img src={photo("students-class")} alt="" className="aspect-[16/10] w-full object-cover" />
            </div>
            <EmojiSticker name="play" size={32} className="absolute -left-1 top-0 -rotate-12" />
            <EmojiSticker name="point" size={28} className="absolute -bottom-3 right-10 rotate-12" />
          </div>
        </div>

        {/* How the tour works */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { emoji: "play" as EmojiName, t: "1. Press Start tour", d: "The demo resets and opens the first screen for you." },
            { emoji: "point" as EmojiName, t: "2. Follow the guide box", d: "It says who you are and what to click. Press Next when done." },
            { emoji: "phone" as EmojiName, t: "3. Phone messages", d: "SMS, WhatsApp and emails appear in the Device simulator (bottom right)." },
          ].map((x, i) => (
            <Card
              key={x.t}
              className={`flex gap-3 rounded-2xl p-4 transition-transform duration-300 hover:rotate-0 ${i % 2 ? "sm:rotate-1" : "sm:-rotate-1"}`}
            >
              <Emoji name={x.emoji} size={36} />
              <div>
                <p className="text-sm font-semibold">{x.t}</p>
                <p className="mt-0.5 text-sm text-muted">{x.d}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Flows */}
        <h2 className="mt-14 flex items-center gap-2 text-2xl font-semibold">
          <Emoji name="sparkles" size={30} /> 4 stories from the demo script
        </h2>
        <div className="mt-5 space-y-5">
          {flows.map((f) => {
            const t = tours.find((x) => x.id === f.tourId)!;
            return (
              <Card key={f.tourId} className="overflow-hidden rounded-[1.5rem] rounded-tr-[3.5rem]">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                  <span className="grid h-16 w-16 shrink-0 -rotate-6 place-items-center rounded-2xl border border-border bg-surface shadow-md">
                    <Emoji name={f.emoji} size={40} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-label font-semibold uppercase tracking-[0.08em] text-muted">Story {t.id} · {t.steps.length} steps · about 2 minutes</p>
                    <h3 className="text-lg font-semibold">{t.title}</h3>
                    <p className="text-body text-muted">{t.short}</p>
                  </div>
                  <Button size="lg" onClick={() => start(t.id)} className="shrink-0">
                    Start tour <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* chain */}
                <div className="border-t border-border bg-surface-2/50 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-stretch">
                    {f.chain.map((c, i) => (
                      <div key={i} className="flex flex-col items-stretch gap-2 md:flex-1 md:flex-row md:items-center">
                        <div className="flex flex-1 items-center gap-3 rounded-xl border border-border bg-surface p-3">
                          {c.who === "System" ? (
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warning-soft"><Emoji name="gear" size={22} /></span>
                          ) : (
                            <Avatar name={c.who} size={36} />
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold leading-tight">{c.does}</p>
                            <p className="mt-0.5 truncate text-label text-muted">
                              {c.who === "System" ? "Platform does it" : `${c.who.split(" ")[0]} · ${c.role}`}
                            </p>
                          </div>
                        </div>
                        {i < f.chain.length - 1 && (
                          <ChevronRight className="mx-auto h-4 w-4 shrink-0 rotate-90 text-muted md:rotate-0" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-4 flex items-start gap-2 text-sm">
                    <span className="font-semibold text-success">Result:</span>
                    <span className="text-muted">{f.result}</span>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* People */}
        <div className="mt-12">
          <div className="flex items-center gap-2">
            <Emoji name="people" size={30} />
            <h2 className="text-2xl font-semibold">Who&apos;s who in the demo</h2>
          </div>
          <p className="mt-1 text-body text-muted">Sample people. The tour switches between them for you, or use “Switch role” in the top bar.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((p) => (
              <Card key={p.name} className="flex items-center gap-3 rounded-2xl p-4">
                <Avatar name={p.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-body font-semibold">{p.name}</p>
                  <p className="truncate text-label text-muted">{p.role}</p>
                  <p className="truncate text-label text-muted">{p.note}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
