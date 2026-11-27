"use client";

import { ArrowRight, BadgeCheck, ChevronRight, Megaphone, MessagesSquare, MousePointerClick, PlayCircle, Smartphone, UserCheck, Users } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { useTour } from "@/components/Tour";
import { Avatar, Button, Card, Pill } from "@/components/ui";
import { tours } from "@/lib/tours";

/* Each flow as a simple chain: who → does what */
const flows: { tourId: number; icon: typeof UserCheck; chain: { who: string; role: string; does: string }[]; result: string }[] = [
  {
    tourId: 1,
    icon: UserCheck,
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
    icon: MessagesSquare,
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
    icon: BadgeCheck,
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
    icon: Megaphone,
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
        <div className="max-w-2xl">
          <Pill tone="primary" icon={<PlayCircle className="h-3.5 w-3.5" />}>
            Guided demo
          </Pill>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">See how the platform works</h1>
          <p className="mt-3 text-body leading-relaxed text-muted">Pick a story below and press <b className="text-text">Start tour</b>. A small guide box will tell you who you are and exactly what to click. You don&apos;t need to log in or remember anything.</p>
        </div>

        {/* How the tour works */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { icon: PlayCircle, t: "1. Press Start tour", d: "The demo resets and opens the first screen for you." },
            { icon: MousePointerClick, t: "2. Follow the guide box", d: "It says who you are and what to click. Press Next when done." },
            { icon: Smartphone, t: "3. Phone messages", d: "SMS, WhatsApp and emails appear in the Device simulator (bottom right)." },
          ].map((x) => (
            <Card key={x.t} className="flex gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-surface-2 text-muted">
                <x.icon className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">{x.t}</p>
                <p className="mt-0.5 text-sm text-muted">{x.d}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Flows */}
        <h2 className="mt-12 text-xl font-semibold tracking-tight">4 stories from VIBGYOR&apos;s demo script</h2>
        <div className="mt-5 space-y-5">
          {flows.map((f) => {
            const t = tours.find((x) => x.id === f.tourId)!;
            return (
              <Card key={f.tourId} className="overflow-hidden">
                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <f.icon className="h-6 w-6" />
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
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warning-soft text-xs font-semibold text-warning">⚙</span>
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
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold tracking-tight">Who&apos;s who in the demo</h2>
          </div>
          <p className="mt-1 text-body text-muted">Sample people. The tour switches between them for you, or use “Switch role” in the top bar.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {people.map((p) => (
              <Card key={p.name} className="flex items-center gap-3 p-4">
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
