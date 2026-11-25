"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarHeart,
  Compass,
  Eye,
  Globe2,
  GraduationCap,
  HeartHandshake,
  Lock,
  MessageCircleHeart,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { PublicFooter, PublicHeader } from "@/components/Public";
import { Avatar, Button, Card, Pill } from "@/components/ui";

const stats = [
  { value: "4,650+", label: "Alumni records" },
  { value: "39", label: "Campuses across India" },
  { value: "24+", label: "Countries alumni live in" },
  { value: "2004", label: "Earliest batch" },
];

const programmes = [
  { name: "Career Assessment", tag: "OSEHub psychometric", who: "Class 8–12", icon: Compass },
  { name: "Junior MBA", tag: "Leadership programme", who: "Class 9–12", icon: Briefcase },
  { name: "SAT / AP Prep", tag: "Test preparation", who: "Class 10–12", icon: BookOpenCheck },
  { name: "Study-abroad Counselling", tag: "1:1 with a counsellor", who: "Parents & students", icon: Globe2 },
];

export default function HomePage() {
  return (
    <>
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <Pill tone="primary" icon={<Sparkles className="h-3.5 w-3.5" />}>
              VIBGYOR Alumni Association
            </Pill>
            <h1 className="mt-5 text-[34px] font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
              Once VIBGYOR, <span className="spectrum-text">always VIBGYOR.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Reconnect with your batch, mentor the students who follow you, and stay close to your school, from any campus and any country.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/join" size="lg">
                Join or claim your profile <ArrowRight className="h-4 w-4" />
              </Button>
              <Button href="/login" size="lg" variant="secondary">
                Student &amp; parent login
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
              <Lock className="h-3.5 w-3.5" /> Data stored in India · DPDP Act 2023 compliant
            </p>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <Card className="relative z-10 p-5">
              <div className="flex items-center gap-3">
                <Avatar name="Priya Sharma" size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold">Priya Sharma</p>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-[13px] text-muted">Batch 2016 · Malad · Software Engineer, Google</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <Pill tone="success">Mentor</Pill>
                <Pill>Imperial College London</Pill>
                <Pill>Computer Science</Pill>
              </div>
              <div className="mt-4 rounded-xl bg-surface-2 p-3.5 text-[13px] leading-relaxed">
                <p className="font-semibold">Aarav, Class 11</p>
                <p className="mt-1 text-muted">How did you prepare for the TMUA? I&apos;m aiming for Imperial too.</p>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted">
                <ShieldCheck className="h-3.5 w-3.5 text-success" /> Recorded · visible to campus office · contact details hidden
              </div>
            </Card>
            <Card className="absolute -bottom-16 -left-4 z-20 hidden w-64 p-4 sm:block lg:-left-10">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-success-soft text-success">
                  <UserCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[13px] font-semibold">Parent consent received</p>
                  <p className="text-[12px] text-muted">Verified by OTP · v1.0</p>
                </div>
              </div>
            </Card>
            <Card className="absolute -right-3 -top-6 z-20 hidden p-3.5 sm:block lg:-right-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">Malad Reunion</p>
              <p className="mt-0.5 text-xl font-bold">
                212 <span className="text-[13px] font-medium text-muted">RSVPs</span>
              </p>
            </Card>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface px-5 py-5">
                <p className="text-2xl font-bold tracking-tight sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-[13px] text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-right text-[11px] text-muted">Sample figures (RFQ §2.2, Oct 2026)</p>
        </div>
      </section>

      {/* Audiences */}
      <section id="about" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-primary">One platform, every VIBGYORite</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">Built for alumni, students, parents and every campus</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
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
          ].map((c) => (
            <Card key={c.title} className="p-6">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{c.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">{c.body}</p>
              <ul className="mt-4 space-y-2">
                {c.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-[13px] font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" /> {p}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Safety */}
      <section id="mentoring" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-6">
        <Card className="overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_1.1fr]">
            <div className="bg-primary p-8 text-primary-fg sm:p-10">
              <ShieldCheck className="h-9 w-9" />
              <h2 className="mt-5 text-3xl font-bold tracking-tight">Safe for children, by design</h2>
              <p className="mt-3 text-[15px] leading-relaxed opacity-85">
                Most students on the platform are under 18. Every safeguard below is on from day one, not an add-on.
              </p>
              <Button href="/demo" variant="secondary" className="mt-6">
                See the safety demo
              </Button>
            </div>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {[
                { icon: UserCheck, title: "Parent consent first", body: "No student account works until a parent confirms by OTP on their school-registered mobile." },
                { icon: BadgeCheck, title: "Vetted mentors only", body: "Students see only alumni with the Mentor badge who signed the safeguarding code." },
                { icon: Eye, title: "Every chat recorded", body: "Student–mentor messages are kept, can't be deleted, and are visible to the campus office." },
                { icon: Lock, title: "Contact details hidden", body: "Phone numbers, emails, links and social handles are masked automatically." },
              ].map((f) => (
                <div key={f.title} className="bg-surface p-6">
                  <f.icon className="h-5 w-5 text-primary" />
                  <p className="mt-3 font-semibold">{f.title}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* MyCareerZ */}
      <section id="mycareerz" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-20 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[13px] font-semibold uppercase tracking-wider text-primary">MyCareerZ × OSEHub</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">Career guidance programmes for families</h2>
            <p className="mt-2 text-[15px] text-muted">From VIBGYOR&apos;s sister career-counselling service. Information for students; enrolment is handled by parents.</p>
          </div>
          <Button href="/enquiry?topic=mycareerz" variant="secondary">
            Ask MyCareerZ <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {programmes.map((p) => (
            <Card key={p.name} className="group p-5 transition-shadow hover:shadow-lg">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-surface-2 text-primary">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 font-semibold">{p.name}</p>
              <p className="text-[13px] text-muted">{p.tag}</p>
              <div className="mt-4 flex items-center justify-between">
                <Pill>{p.who}</Pill>
                <Link href="/enquiry?topic=mycareerz" className="text-[13px] font-semibold text-primary group-hover:underline">
                  Enquire
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-12">
          <div className="spectrum absolute inset-x-0 top-0 h-1" />
          <CalendarHeart className="mx-auto h-9 w-9 text-primary" />
          <h2 className="mx-auto mt-4 max-w-xl text-3xl font-bold tracking-tight">Your batch is already here. Come back.</h2>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted">
            If you were on the old alumni portal, your profile is waiting. Claim it in under two minutes.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/join" size="lg">
              Claim my profile
            </Button>
            <Button href="/demo" size="lg" variant="secondary">
              <MessageCircleHeart className="h-4 w-4" /> Take the guided demo
            </Button>
          </div>
        </div>
      </section>

      <PublicFooter />
    </>
  );
}
