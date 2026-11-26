"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarDays,
  Check,
  Compass,
  Eye,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Lock,
  LogIn,
  MapPin,
  MessageCircleHeart,
  School,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Avatar, Button, Card, LogoTiles, Pill } from "@/components/ui";
import { campuses } from "@/lib/data";
import { CountUp, Reveal } from "@/components/motion";

/* ------------------------------------------------------------------ data */

const stats = [
  { value: "4,650+", label: "Alumni records", icon: Users },
  { value: "39", label: "Campuses across India", icon: School },
  { value: "24+", label: "Countries alumni live in", icon: Globe2 },
  { value: "2004", label: "Earliest batch", icon: CalendarDays },
];

type AlumniNow = { name: string; batch: number; role: string; org: string; place: string; tag?: "Mentor" | "Hiring" | "Studying" };

const alumniNow: AlumniNow[] = [
  { name: "Priya Sharma", batch: 2016, role: "Software Engineer", org: "Google", place: "London, UK", tag: "Mentor" },
  { name: "Rohan Gupta", batch: 2008, role: "Director, Product", org: "Flipkart", place: "Bengaluru", tag: "Hiring" },
  { name: "Farah Ansari", batch: 2013, role: "Associate", org: "McKinsey & Co.", place: "London, UK" },
  { name: "Ananya Desai", batch: 2017, role: "Resident Doctor", org: "Manipal Hospitals", place: "Bengaluru", tag: "Mentor" },
  { name: "Meera Joshi", batch: 2021, role: "MSc Computing", org: "Imperial College", place: "London, UK", tag: "Studying" },
  { name: "Kabir Rao", batch: 2014, role: "Senior Data Scientist", org: "Shopify", place: "Toronto, Canada" },
  { name: "Arjun Nair", batch: 2013, role: "Chartered Accountant", org: "Deloitte", place: "Mumbai", tag: "Mentor" },
  { name: "Ananya Banerjee", batch: 2011, role: "Cabin Services Manager", org: "Emirates", place: "Dubai, UAE" },
  { name: "Aman Verma", batch: 2008, role: "Backend Engineer", org: "Razorpay", place: "Bengaluru", tag: "Hiring" },
  { name: "Isha Malhotra", batch: 2012, role: "Creative Lead", org: "Ogilvy", place: "Singapore" },
];
const heroColumns = [alumniNow.slice(0, 5), alumniNow.slice(5, 10)];

const tagTone = { Mentor: "success", Hiring: "info", Studying: "neutral" } as const;

const cities = [...new Set(campuses.map((c) => c.city))];

const audiences = [
  {
    icon: Users,
    title: "Alumni",
    body: "Claim your profile, find batchmates by campus, city or company, and give back as a mentor, recruiter or speaker.",
    points: ["Directory & batch groups", "Jobs and reunions", "Mentor students safely"],
  },
  {
    icon: GraduationCap,
    title: "Students (Class 8–12)",
    body: "Get guidance on courses, colleges and countries from vetted alumni mentors who have been there.",
    points: ["Mentors matched to your choices", "Guidance videos", "Internships approved by school"],
  },
  {
    icon: HeartHandshake,
    title: "Parents",
    body: "You decide what your child can do. Give or withdraw each permission at any time, in one place.",
    points: ["OTP-verified consent", "See every permission", "Withdraw instantly"],
  },
];

const safeguards = [
  { icon: UserCheck, title: "Parent consent first", body: "No student account works until a parent confirms by OTP on their school-registered mobile." },
  { icon: BadgeCheck, title: "Vetted mentors only", body: "Students see only alumni with the Mentor badge who signed the safeguarding code." },
  { icon: Eye, title: "Every chat recorded", body: "Student–mentor messages are kept, can't be deleted, and are visible to the campus office." },
  { icon: Lock, title: "Contact details hidden", body: "Phone numbers, emails, links and social handles are masked automatically." },
];

const steps = [
  { icon: Search, title: "Find your profile", body: "Search by name, campus and batch. Your record from the old portal is probably already here." },
  { icon: ShieldCheck, title: "Get verified", body: "Your campus office or two batchmates confirm it's really you. Usually within a day." },
  { icon: HeartHandshake, title: "Reconnect & give back", body: "Join your batch group, RSVP to reunions, share jobs or become a mentor." },
];

const programmes = [
  { name: "Career Assessment", tag: "OSEHub psychometric", who: "Class 8–12", icon: Compass },
  { name: "Junior MBA", tag: "Leadership programme", who: "Class 9–12", icon: Briefcase },
  { name: "SAT / AP Prep", tag: "Test preparation", who: "Class 10–12", icon: BookOpenCheck },
  { name: "Study-abroad Counselling", tag: "1:1 with a counsellor", who: "Parents & students", icon: Globe2 },
];

/* ------------------------------------------------------------------ pieces */

function IconTile({ icon: Icon, size = "md" }: { icon: typeof Users; size?: "md" | "lg" }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ${size === "lg" ? "h-12 w-12" : "h-11 w-11"}`}>
      <Icon className="h-5 w-5" />
    </span>
  );
}

function SectionHeading({ eyebrow, title, body, center, invert }: { eyebrow: string; title: string; body?: string; center?: boolean; invert?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className={`text-[13px] font-bold uppercase tracking-[0.14em] ${invert ? "text-white/70" : "text-primary"}`}>{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-[40px] sm:leading-[1.15]">{title}</h2>
      {body && <p className={`mt-4 text-[16px] leading-relaxed ${invert ? "text-white/75" : "text-muted"}`}>{body}</p>}
    </div>
  );
}

function AlumniNowCard({ a }: { a: AlumniNow }) {
  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar name={a.name} size={44} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5">
            <span className="truncate text-[15px] font-bold">{a.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 text-primary" aria-label="Verified" />
          </p>
          <p className="text-[13px] text-muted">Batch {a.batch}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-border pt-4">
        <p className="text-[14px] font-semibold">{a.role}</p>
        <p className="text-[14px] text-muted">{a.org}</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-[13px] text-muted">
            <MapPin className="h-3.5 w-3.5 shrink-0" /> {a.place}
          </span>
          {a.tag && <Pill tone={tagTone[a.tag]}>{a.tag}</Pill>}
        </div>
      </div>
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
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pb-20 lg:pt-20">
          <div>
            <p className="enter enter-1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-semibold text-muted shadow-card">
              <span className="h-2 w-2 rounded-full bg-success" /> VIBGYOR Alumni Association
            </p>
            <h1 className="enter enter-2 mt-6 text-[38px] font-extrabold leading-[1.08] tracking-tight text-text sm:text-5xl lg:text-[56px]">
              One VIBGYOR.
              <br />
              Every Generation.
              <br />
              <span className="accent-underline">A Lifetime of Connections.</span>
            </h1>
            <p className="enter enter-3 mt-7 max-w-lg text-[18px] leading-relaxed text-muted">
              Reconnect with your batch, mentor the students who follow you, and stay close to your school, from any campus and any country.
            </p>
            <div className="enter enter-4 mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="/join" size="lg" className="group px-6">
                <UserPlus className="h-[18px] w-[18px]" /> Join or claim your profile
                <ArrowRight className="icon-nudge h-4 w-4" />
              </Button>
              <Button href="/login" size="lg" variant="secondary" className="px-6">
                <LogIn className="h-[18px] w-[18px]" /> Student &amp; parent login
              </Button>
            </div>
            <div className="enter enter-5 mt-10 flex items-center gap-4">
              <div className="flex">
                {["Priya Sharma", "Rohan Gupta", "Farah Ansari", "Kabir Rao", "Meera Joshi"].map((n, i) => (
                  <span key={n} className={i ? "-ml-2.5" : ""}>
                    <Avatar name={n} size={38} className="ring-[3px] ring-surface" />
                  </span>
                ))}
              </div>
              <div className="text-[14px] leading-snug">
                <p className="font-bold">4,650+ alumni already here</p>
                <p className="flex items-center gap-1.5 text-muted">
                  <Lock className="h-3.5 w-3.5" /> Data stored in India · DPDP Act 2023
                </p>
              </div>
            </div>
          </div>

          {/* Where VIBGYORites are now */}
          <div className="enter enter-3">
            <div className="hero-cols grid h-[460px] grid-cols-1 gap-4 overflow-hidden sm:h-[540px] sm:grid-cols-2">
              {heroColumns.map((col, ci) => (
                <div key={ci} className={ci === 1 ? "hidden sm:block" : ""}>
                  <div className={ci === 1 ? "col-down" : "col-up"}>
                    {[...col, ...col].map((a, i) => (
                      <AlumniNowCard key={i} a={a} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-[13px] text-muted">Where VIBGYORites are now · sample profiles</p>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-border">
          <div className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
            {stats.map((st, i) => (
              <div
                key={st.label}
                className={`flex items-center gap-4 py-7 ${i % 2 ? "pl-5 border-l border-border" : ""} ${i >= 2 ? "border-t border-border md:border-t-0" : ""} ${i === 2 ? "md:border-l md:pl-5" : ""}`}
              >
                <IconTile icon={st.icon} />
                <div>
                  <p className="text-[28px] font-extrabold leading-none tracking-tight">
                    <CountUp value={st.value} />
                  </p>
                  <p className="mt-1.5 text-[13px] font-medium text-muted">{st.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Campus strip */}
        <div className="border-t border-border bg-bg">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-6">
            <p className="hidden shrink-0 text-[13px] font-semibold text-muted md:block">39 campuses</p>
            <span className="hidden h-6 w-px shrink-0 bg-border md:block" />
            <div className="marquee relative flex-1 overflow-hidden">
              <div className="marquee-track flex w-max gap-10">
                {[...cities, ...cities].map((c, i) => (
                  <span key={i} className="whitespace-nowrap text-[14px] font-semibold text-muted">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section id="about" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="One platform, every VIBGYORite"
              title="Built for alumni, students, parents and every campus"
              body="Three audiences, one safe space. Everyone sees what is right for them, and nothing more."
              center
            />
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {audiences.map((c, i) => (
              <Reveal key={c.title} delay={i * 100}>
                <Card className="lift h-full p-7">
                  <IconTile icon={c.icon} size="lg" />
                  <h3 className="mt-5 text-lg font-bold">{c.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-muted">{c.body}</p>
                  <ul className="mt-6 space-y-3 border-t border-border pt-6">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-center gap-3 text-[14px] font-medium">
                        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft text-success">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Safety — flat navy band */}
      <section id="mentoring" className="scroll-mt-20 bg-navy py-24 text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.25fr]">
          <Reveal>
            <SectionHeading
              invert
              eyebrow="Safeguarding"
              title="Safe for children, by design"
              body="Most students on the platform are under 18. Every safeguard below is on from day one, not an add-on."
            />
            <Link
              href="/demo"
              className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-navy shadow-card transition-transform hover:-translate-y-px"
            >
              See the safety demo <ArrowRight className="icon-nudge h-4 w-4" />
            </Link>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {safeguards.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/12 bg-white/[0.04] p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-white">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <p className="mt-4 text-[16px] font-bold">{f.title}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/70">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border bg-surface py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Back with your batch in three steps" center />
          </Reveal>
          <ol className="relative mt-16 grid gap-12 md:grid-cols-3 md:gap-8">
            <span className="absolute left-[17%] right-[17%] top-6 hidden border-t-2 border-dashed border-border md:block" aria-hidden />
            {steps.map((st, i) => (
              <Reveal as="li" key={st.title} delay={i * 120} className="relative text-center">
                <span className="relative mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary text-[17px] font-extrabold text-primary-fg ring-8 ring-surface">
                  {i + 1}
                </span>
                <p className="mt-6 flex items-center justify-center gap-2 text-lg font-bold">
                  <st.icon className="h-5 w-5 text-primary" /> {st.title}
                </p>
                <p className="mx-auto mt-2 max-w-xs text-[15px] leading-relaxed text-muted">{st.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* MyCareerZ */}
      <section id="mycareerz" className="scroll-mt-20 py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              eyebrow="MyCareerZ × OSEHub"
              title="Career guidance programmes for families"
              body="From VIBGYOR's sister career-counselling service. Information for students; enrolment is handled by parents."
            />
            <Button href="/enquiry?topic=mycareerz" variant="secondary" className="group shrink-0">
              Ask MyCareerZ <ArrowRight className="icon-nudge h-4 w-4" />
            </Button>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {programmes.map((p, i) => (
              <Reveal key={p.name} delay={i * 80}>
                <Link href="/enquiry?topic=mycareerz" className="group block h-full">
                  <Card className="lift flex h-full flex-col p-6">
                    <IconTile icon={p.icon} />
                    <p className="mt-5 text-[16px] font-bold">{p.name}</p>
                    <p className="mt-1 text-[14px] text-muted">{p.tag}</p>
                    <div className="mt-auto flex items-center justify-between pt-6">
                      <Pill>{p.who}</Pill>
                      <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                        Enquire <ArrowRight className="icon-nudge h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Card>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <Reveal as="section" className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
        <div className="rounded-2xl bg-navy px-6 py-16 text-center text-white sm:px-12">
          <LogoTiles size="md" className="justify-center" />
          <h2 className="mx-auto mt-7 max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-[40px] sm:leading-[1.15]">
            Your batch is already here. Come back.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[16px] text-white/75">If you were on the old alumni portal, your profile is waiting. Claim it in under two minutes.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/join"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-navy transition-transform hover:-translate-y-px"
            >
              Claim my profile <ArrowRight className="icon-nudge h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/25 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
            >
              <MessageCircleHeart className="h-4 w-4" /> Take the guided demo
            </Link>
          </div>
        </div>
      </Reveal>

      <PublicFooter />
    </>
  );
}
