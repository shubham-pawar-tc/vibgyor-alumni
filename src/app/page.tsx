"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Check, Lock, Search } from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Avatar, Button, Pill } from "@/components/ui";
import { campuses } from "@/lib/data";
import { Enter, EnterItem, Reveal } from "@/components/motion";

/* ------------------------------------------------------------------ data */

const stats = [
  { value: "4,650+", label: "Alumni records" },
  { value: "39", label: "Campuses across India" },
  { value: "24+", label: "Countries alumni live in" },
  { value: "2004", label: "Earliest batch" },
];

type AlumniNow = { name: string; batch: number; role: string; org: string; place: string; tag?: "Mentor" | "Hiring" };

const directoryPreview: AlumniNow[] = [
  { name: "Priya Sharma", batch: 2016, role: "Software Engineer", org: "Google", place: "London", tag: "Mentor" },
  { name: "Rohan Gupta", batch: 2008, role: "Director, Product", org: "Flipkart", place: "Bengaluru", tag: "Hiring" },
  { name: "Farah Ansari", batch: 2013, role: "Associate", org: "McKinsey & Co.", place: "London" },
  { name: "Ananya Desai", batch: 2017, role: "Resident Doctor", org: "Manipal Hospitals", place: "Bengaluru", tag: "Mentor" },
  { name: "Kabir Rao", batch: 2014, role: "Senior Data Scientist", org: "Shopify", place: "Toronto" },
];

const cities = [...new Set(campuses.map((c) => c.city))];

const audiences = [
  {
    title: "Alumni",
    body: "Claim your profile, find batchmates by campus, city or company, and give back as a mentor, recruiter or speaker.",
    points: ["Directory and batch groups", "Jobs and reunions", "Mentor students safely"],
  },
  {
    title: "Students, Class 8–12",
    body: "Get guidance on courses, colleges and countries from vetted alumni mentors who have been there.",
    points: ["Mentors matched to your choices", "Guidance videos", "Internships approved by school"],
  },
  {
    title: "Parents",
    body: "You decide what your child can do. Give or withdraw each permission at any time, in one place.",
    points: ["OTP-verified consent", "See every permission", "Withdraw instantly"],
  },
];

const safeguards = [
  { title: "Parent consent first", body: "No student account works until a parent confirms by OTP on their school-registered mobile." },
  { title: "Vetted mentors only", body: "Students see only alumni with the Mentor badge who signed the safeguarding code." },
  { title: "Every chat recorded", body: "Student–mentor messages are kept, can't be deleted, and are visible to the campus office." },
  { title: "Contact details hidden", body: "Phone numbers, emails, links and social handles are masked automatically." },
];

const steps = [
  { title: "Find your profile", body: "Search by name, campus and batch. Your record from the old portal is probably already here." },
  { title: "Get verified", body: "Your campus office or two batchmates confirm it's really you, usually within a day." },
  { title: "Reconnect and give back", body: "Join your batch group, RSVP to reunions, share jobs or become a mentor." },
];

const programmes = [
  { name: "Career Assessment", tag: "OSEHub psychometric", who: "Class 8–12" },
  { name: "Junior MBA", tag: "Leadership programme", who: "Class 9–12" },
  { name: "SAT / AP Prep", tag: "Test preparation", who: "Class 10–12" },
  { name: "Study-abroad Counselling", tag: "1:1 with a counsellor", who: "Parents & students" },
];

/* ------------------------------------------------------------------ pieces */

function SectionHeading({ eyebrow, title, body, invert }: { eyebrow: string; title: string; body?: string; invert?: boolean }) {
  return (
    <div className="max-w-xl">
      <p className={invert ? "eyebrow !text-white/60" : "eyebrow"}>{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl sm:leading-[1.15]">{title}</h2>
      {body && <p className={`mt-4 text-base leading-relaxed ${invert ? "text-white/70" : "text-muted"}`}>{body}</p>}
    </div>
  );
}

/** A static, honest preview of the real directory screen. */
function DirectoryPreview() {
  return (
    <div className="overflow-hidden rounded-[var(--card-radius)] border border-border bg-surface shadow-md">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Alumni directory</p>
        <span className="text-label text-muted">Verified members only</span>
      </div>
      <div className="border-b border-border px-4 py-3">
        <div className="flex h-9 items-center gap-2 rounded-[var(--input-radius)] border border-border-strong px-3 text-sm text-subtle">
          <Search className="h-4 w-4" /> Search by name, company or city
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill tone="primary">Batch 2008–2017</Pill>
          <Pill>London</Pill>
          <Pill>Mentors</Pill>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {directoryPreview.map((a) => (
          <li key={a.name} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={a.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <span className="truncate">{a.name}</span>
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-secondary" aria-label="Verified" />
              </p>
              <p className="truncate text-label text-muted">
                {a.role}, {a.org} · {a.place}
              </p>
            </div>
            <span className="hidden text-label tabular-nums text-muted sm:block">’{String(a.batch).slice(2)}</span>
            {a.tag && <Pill tone={a.tag === "Mentor" ? "success" : "info"}>{a.tag}</Pill>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="container-page grid items-center gap-12 py-14 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-20">
          <Enter>
            <EnterItem as="p" className="eyebrow">VIBGYOR Alumni Association</EnterItem>
            <EnterItem as="h1" className="mt-4 text-4xl font-semibold sm:text-5xl">
              One VIBGYOR.
              <br />
              Every generation.
            </EnterItem>
            <EnterItem as="p" className="mt-6 max-w-lg text-lg text-muted">
              Reconnect with your batch, mentor the students who follow you, and stay close to your school — from any campus, in any country.
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
              <Lock className="h-3.5 w-3.5" /> Data stored in India under the DPDP Act 2023
            </EnterItem>
          </Enter>
          <Reveal delay={150}>
            <DirectoryPreview />
            <p className="mt-3 text-label text-subtle">Sample profiles from the prototype.</p>
          </Reveal>
        </div>

        {/* Key figures */}
        <div className="border-t border-border">
          <dl className="container-page grid grid-cols-2 md:grid-cols-4">
            {stats.map((st, i) => (
              <div
                key={st.label}
                className={[
                  "py-6",
                  i % 2 ? "border-l border-border pl-5" : "",
                  i >= 2 ? "border-t border-border md:border-t-0" : "",
                  i === 2 ? "md:border-l md:pl-5" : "",
                ].join(" ")}
              >
                <dt className="text-label text-muted">{st.label}</dt>
                <dd className="mt-1 font-display text-3xl font-semibold leading-none tabular-nums">{st.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Audiences: a divided list rather than a row of cards */}
      <section id="about" className="section-y scroll-mt-20">
        <Reveal className="container-page grid gap-10 lg:grid-cols-[1fr_2fr] lg:gap-16">
          <SectionHeading
            eyebrow="Who it's for"
            title="One platform for every VIBGYORite"
            body="Everyone sees what is right for them, and nothing more."
          />
          <div className="divide-y divide-border border-y border-border">
            {audiences.map((a) => (
              <div key={a.title} className="grid gap-4 py-7 sm:grid-cols-[1fr_1fr] sm:gap-8">
                <div>
                  <h3 className="text-lg font-semibold">{a.title}</h3>
                  <p className="mt-2 text-body leading-relaxed text-muted">{a.body}</p>
                </div>
                <ul className="space-y-3 sm:pt-1">
                  {a.points.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-body">
                      <Check className="mt-[3px] h-4 w-4 shrink-0 text-accent-strong" strokeWidth={2.5} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* Safeguarding */}
      <section id="safeguarding" className="section-y scroll-mt-20 bg-navy text-white">
        <Reveal className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <SectionHeading
              invert
              eyebrow="Safeguarding"
              title="Safe for children, by design"
              body="Most students on the platform are under 18. Every safeguard below is on from day one, not an add-on."
            />
            <Link
              href="/demo"
              className="mt-8 inline-flex h-[var(--btn-h-lg)] items-center gap-2 rounded-[var(--btn-radius)] bg-white px-5 text-body font-semibold text-[#172b4d] transition-colors hover:bg-white/90"
            >
              See the safety demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ol className="grid gap-x-10 sm:grid-cols-2">
            {safeguards.map((f, i) => (
              <li key={f.title} className="border-t border-white/15 py-6">
                <p className="font-display text-label font-semibold tabular-nums text-white/50">{String(i + 1).padStart(2, "0")}</p>
                <p className="mt-2 text-lg font-semibold">{f.title}</p>
                <p className="mt-2 text-body leading-relaxed text-white/70">{f.body}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="section-y border-b border-border bg-surface">
        <Reveal className="container-page">
          <SectionHeading eyebrow="How it works" title="Back with your batch in three steps" />
          <ol className="mt-12 grid gap-8 md:grid-cols-3 md:gap-10">
            {steps.map((st, i) => (
              <li key={st.title} className="border-t-2 border-primary pt-5">
                <p className="font-display text-sm font-semibold tabular-nums text-muted">Step {i + 1}</p>
                <p className="mt-2 text-lg font-semibold">{st.title}</p>
                <p className="mt-2 text-body leading-relaxed text-muted">{st.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-baseline sm:gap-6">
            <p className="shrink-0 font-semibold text-text">39 campuses</p>
            <p className="leading-relaxed">{cities.join(" · ")}</p>
          </div>
        </Reveal>
      </section>

      {/* MyCareerZ */}
      <section id="mycareerz" className="section-y scroll-mt-20">
        <Reveal className="container-page">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="MyCareerZ × OSEHub"
              title="Career guidance programmes for families"
              body="From VIBGYOR's sister career-counselling service. Information for students; enrolment is handled by parents."
            />
            <Button href="/enquiry?topic=mycareerz" variant="secondary" className="shrink-0">
              Ask MyCareerZ <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-10 overflow-hidden rounded-[var(--card-radius)] border border-border bg-surface">
            <ul className="divide-y divide-border">
              {programmes.map((p) => (
                <li key={p.name}>
                  <Link href="/enquiry?topic=mycareerz" className="group grid items-center gap-1 px-5 py-4 transition-colors hover:bg-surface-2/60 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:gap-6">
                    <span className="text-body font-semibold">{p.name}</span>
                    <span className="text-sm text-muted">{p.tag}</span>
                    <span className="text-sm text-muted">{p.who}</span>
                    <span className="hidden items-center gap-1 text-sm font-medium text-link sm:inline-flex">
                      Enquire <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>

      {/* Closing call to action */}
      <section className="container-page">
        <div className="flex flex-col gap-6 rounded-[var(--card-radius)] border border-border bg-surface px-6 py-10 sm:px-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold sm:text-3xl">Your batch is already here.</h2>
            <p className="mt-2 text-base text-muted">If you were on the old alumni portal, your profile is waiting. Claim it in under two minutes.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Button href="/join" size="lg">
              Claim my profile
            </Button>
            <Button href="/demo" size="lg" variant="secondary">
              Take the guided demo
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
