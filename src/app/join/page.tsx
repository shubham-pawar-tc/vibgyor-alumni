"use client";

import { allOk, check, clean, normalizeMobile, whenFilled } from "@/lib/validate";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, AtSign, BadgeCheck, Check, CheckCircle2, Clock, Copy, Database, Hash, HeartHandshake, History, Lock, Mail, MailCheck, PartyPopper, Phone, Search, ShieldCheck, Sparkles, User, UserPlus, Users, Wand2 } from "lucide-react";
import { AuthBand, PublicFooter, PublicHeader } from "@/components/Public";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { Avatar, Button, Callout, Card, Field, Input, Pill, Req, Select } from "@/components/ui";
import { campuses, campusName, type MigratedRecord } from "@/lib/data";
import { useStore, type VerificationResult } from "@/lib/store";
import { maskMobile } from "@/lib/utils";
import { DemoOtpFill } from "@/components/DemoOtpFill";

type Step = "start" | "claim" | "found" | "details" | "otp" | "result";

const years = Array.from({ length: 2026 - 2003 }, (_, i) => 2026 - i);

export default function JoinPage() {
  const { findMigrated, sendOtp, checkOtp, submitVerification, login } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [lookup, setLookup] = useState("");
  const [lookupErr, setLookupErr] = useState("");
  const [migrated, setMigrated] = useState<MigratedRecord | null>(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", campusId: "c01", passYear: 2014, admissionNo: "" });
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [copied, setCopied] = useState(false);

  const otpKey = `join:${form.email || lookup}`;

  const doLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const m = findMigrated(lookup);
    if (!m) {
      setLookupErr("No profile found with that email or mobile. You can sign up as new instead.");
      return;
    }
    setLookupErr("");
    setMigrated(m);
    setForm({ name: m.name, email: m.email, mobile: m.mobile, campusId: m.campusId, passYear: m.batch, admissionNo: "" });
    setStep("found");
  };

  const goOtp = () => {
    sendOtp(otpKey, form.email ? form.email : maskMobile(form.mobile), undefined, "joining the VIBGYOR Alumni Association");
    setCode("");
    setCodeErr("");
    setStep("otp");
  };

  const verify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkOtp(otpKey, code)) {
      setCodeErr("That code isn't right. Check the device simulator.");
      return;
    }
    const ref = new URLSearchParams(window.location.search).get("ref") ?? undefined;
    const r = submitVerification({ ...form, name: form.name.trim(), mobile: normalizeMobile(form.mobile), migratedId: migrated?.id, ref });
    setResult(r);
    setStep("result");
  };

  const errs = { name: check.name(form.name), email: check.email(form.email), mobile: check.mobile(form.mobile), admissionNo: check.admission(form.admissionNo) };
  const detailsValid = allOk(...Object.values(errs)) && !!form.passYear;
  const lookupErr2 = check.emailOrMobile(lookup);

  return (
    <>
      <PublicHeader />
      <AuthBand
        eyebrow="Join the VIBGYOR Alumni Association"
        eyebrowIcon={UserPlus}
        title={
          <>
            One VIBGYOR. Every Generation.
            <span className="mt-1 block text-primary">
              <span className="accent-underline box-decoration-clone">A Lifetime of Connections.</span>
            </span>
          </>
        }
        body="Claim the profile you had on the old portal or sign up fresh. It takes under two minutes."
        chips={[
          { icon: History, label: "Old profiles kept", color: "var(--o)" },
          { icon: BadgeCheck, label: "Instant verification", color: "var(--g)" },
          { icon: Lock, label: "You control your privacy", color: "var(--v)" },
        ]}
      />
      <main className="relative mx-auto -mt-20 grid max-w-6xl items-start gap-8 px-4 pb-6 sm:px-6 lg:grid-cols-[1.35fr_1fr]">
        <Reveal>
        <Card className="relative overflow-hidden p-6 shadow-lift sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Progress step={step} />
            <div className="flex items-center gap-1.5">
              <Req ids="A1" /> <Req ids="A2" /> <Req ids="DM-5" />
            </div>
          </div>

          {step === "start" && (
            <div className="animate-in">
              <h1 className="mt-6 text-2xl font-extrabold tracking-tight sm:text-3xl">How would you like to start?</h1>
              <p className="mt-2 text-[15px] text-muted">Were you on the previous alumni portal? Your profile, batch and history are already here.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button onClick={() => setStep("claim")} className="group relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-primary-soft/40 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lift">
                  <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[11.5px] font-bold uppercase tracking-wide text-primary-fg">Most alumni</span>
                  <span className="icon-bounce grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-fg">
                    <History className="h-6 w-6" />
                  </span>
                  <p className="mt-4 font-bold">Claim my existing profile</p>
                  <p className="mt-1 text-[14px] text-muted">Find it with the email or mobile you used before. No need to start again.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                    Find my profile <ArrowRight className="icon-nudge h-3.5 w-3.5" />
                  </span>
                </button>
                <button onClick={() => setStep("details")} className="group rounded-2xl border-2 border-border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lift">
                  <span className="icon-bounce grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
                    <UserPlus className="h-6 w-6" />
                  </span>
                  <p className="mt-4 font-bold">I&apos;m new here</p>
                  <p className="mt-1 text-[14px] text-muted">Sign up with your campus, pass year and admission number.</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-primary">
                    Sign up <ArrowRight className="icon-nudge h-3.5 w-3.5" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {step === "claim" && (
            <form onSubmit={doLookup} className="animate-in">
              <BackBtn onClick={() => setStep("start")} />
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Find your profile</h1>
              <p className="mt-1 text-sm text-muted">Enter the email or mobile number you used on the previous alumni portal.</p>
              <div className="mt-6 space-y-4">
                <Field label="Email or mobile" htmlFor="lookup" error={whenFilled(lookup, lookupErr2)} hint={<>Demo: <button type="button" className="font-semibold text-primary" onClick={() => setLookup("karan.malhotra@example.com")}>karan.malhotra@example.com</button></>}>
                  <Input id="lookup" icon={<AtSign />} value={lookup} invalid={!!whenFilled(lookup, lookupErr2)} onChange={(e) => setLookup(clean.emailOrMobile(e.target.value))} placeholder="you@example.com" autoFocus />
                </Field>
                {lookupErr && <Callout tone="warning">{lookupErr}</Callout>}
                <Button type="submit" size="lg" className="w-full" disabled={!!lookupErr2}>
                  <Search className="h-4 w-4" /> Search
                </Button>
              </div>
            </form>
          )}

          {step === "found" && migrated && (
            <div className="animate-in">
              <BackBtn onClick={() => setStep("claim")} />
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Is this you?</h1>
              <p className="mt-1 text-sm text-muted">We found a profile migrated from the previous alumni portal.</p>
              <div className="pop mt-6 rounded-2xl border border-primary/25 bg-primary-soft/30 p-5">
                <div className="flex items-center gap-4">
                  <Avatar name={migrated.name} size={52} />
                  <div className="min-w-0">
                    <p className="text-lg font-semibold">{migrated.name}</p>
                    <p className="text-[14px] text-muted">
                      Batch {migrated.batch} · {campusName(migrated.campusId)}
                    </p>
                  </div>
                </div>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-[14px]">
                  {migrated.college && <Info label="College" value={migrated.college} />}
                  {migrated.company && <Info label="Work" value={`${migrated.title}, ${migrated.company}`} />}
                  <Info label="Status on old portal" value={migrated.verified ? "Verified" : "Not verified"} />
                  <Info label="Engagement history" value={`${migrated.engagementCount} records kept`} />
                </dl>
              </div>
              <Callout tone="info" className="mt-4">
                We&apos;ll send a code to <b>{migrated.email}</b> to confirm it&apos;s you.
              </Callout>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button size="lg" className="flex-1" onClick={goOtp}>
                  <CheckCircle2 className="h-4 w-4" /> Yes, claim this profile
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setStep("details")}>
                  Not me
                </Button>
              </div>
            </div>
          )}

          {step === "details" && (
            <div className="animate-in">
              <BackBtn onClick={() => setStep("start")} />
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Tell us about your time at VIBGYOR</h1>
              <p className="mt-1 text-sm text-muted">We check these against school records to verify you automatically.</p>
              <div className="mt-6 space-y-4">
                <Field label="Full name (as in school records)" htmlFor="n" error={whenFilled(form.name, errs.name)}>
                  <Input id="n" icon={<User />} value={form.name} invalid={!!whenFilled(form.name, errs.name)} onChange={(e) => setForm({ ...form, name: clean.name(e.target.value) })} placeholder="e.g. Karan Malhotra" autoComplete="name" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" htmlFor="e" error={whenFilled(form.email, errs.email)}>
                    <Input id="e" icon={<Mail />} type="email" value={form.email} invalid={!!whenFilled(form.email, errs.email)} onChange={(e) => setForm({ ...form, email: clean.email(e.target.value) })} placeholder="you@example.com" autoComplete="email" />
                  </Field>
                  <Field label="Mobile" htmlFor="m" error={whenFilled(form.mobile, errs.mobile)} hint="India: 10 digits. Abroad: + country code">
                    <Input id="m" icon={<Phone />} type="tel" inputMode="tel" value={form.mobile} invalid={!!whenFilled(form.mobile, errs.mobile)} onChange={(e) => setForm({ ...form, mobile: clean.mobile(e.target.value) })} placeholder="+91 98765 43210" autoComplete="tel" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Campus" htmlFor="c">
                    <Select id="c" value={form.campusId} onChange={(e) => setForm({ ...form, campusId: e.target.value })}>
                      {campuses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}, {c.city}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Pass-out year (Class 12)" htmlFor="y">
                    <Select id="y" value={form.passYear} onChange={(e) => setForm({ ...form, passYear: Number(e.target.value) })}>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Field label="Admission / roll number" htmlFor="a" error={whenFilled(form.admissionNo, errs.admissionNo)} hint="Optional, but it lets us verify you instantly. It's on your school ID or leaving certificate.">
                  <Input id="a" icon={<Hash />} value={form.admissionNo} invalid={!!whenFilled(form.admissionNo, errs.admissionNo)} onChange={(e) => setForm({ ...form, admissionNo: clean.admission(e.target.value) })} placeholder="VG-MAL-2014-0187" className="font-mono" />
                </Field>
                <div className="rounded-xl border border-dashed border-warning/40 bg-warning-soft/50 p-3.5 text-[13.5px] text-muted">
                  <p className="mb-2 flex items-center gap-1.5 font-semibold text-text">
                    <Wand2 className="h-3.5 w-3.5 text-warning" /> Demo data
                  </p>
                  <button
                    type="button"
                    className="block font-semibold text-primary"
                    onClick={() => setForm({ name: "Karan Malhotra", email: "karan.m.new@example.com", mobile: "+91 98200 11187", campusId: "c01", passYear: 2014, admissionNo: "VG-MAL-2014-0187" })}
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />Fill an exact match → auto-verified
                  </button>
                  <button
                    type="button"
                    className="mt-1 block font-semibold text-primary"
                    onClick={() => setForm({ name: "Pooja Reddy", email: "pooja.r.new@example.com", mobile: "+91 98190 22033", campusId: "c01", passYear: 2019, admissionNo: "VG-MAL-2019-0303" })}
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />Fill a typo in admission no. → staff queue
                  </button>
                  <button
                    type="button"
                    className="mt-1 block font-semibold text-primary"
                    onClick={() => setForm({ name: "Rahul Desai", email: "rahul.desai@example.com", mobile: "+1 415 555 0119", campusId: "c01", passYear: 2007, admissionNo: "" })}
                  >
                    <Sparkles className="mr-1 inline h-3 w-3" />Fill a 2007 batch (no ERP record) → queue + peer vouch
                  </button>
                </div>
                <Button size="lg" className="w-full" disabled={!detailsValid} onClick={goOtp}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <form onSubmit={verify} className="animate-in">
              <BackBtn onClick={() => setStep(migrated ? "found" : "details")} />
              <h1 className="mt-2 text-2xl font-extrabold tracking-tight">Check your email</h1>
              <p className="mt-1 text-sm text-muted">
                We sent a 6-digit code to <b className="text-text">{form.email}</b>.
              </p>
              <div className="mt-6 space-y-4">
                <Input icon={<MailCheck />} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="h-14 text-center font-mono text-2xl tracking-[0.5em]" autoFocus aria-label="6-digit code" />
                {codeErr && <p className="text-[14px] font-medium text-danger">{codeErr}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
                  <ShieldCheck className="h-4 w-4" /> Verify
                </Button>
                <DemoOtpFill otpKey={otpKey} onFill={(c) => { setCode(c); setCodeErr(""); }} />
                <p className="text-center text-[13px] text-muted">Demo: the latest code is also at the top of the device simulator, bottom right.</p>
              </div>
            </form>
          )}

          {step === "result" && result && (
            <div className="animate-in">
              {result.outcome === "pending" ? (
                <>
                  <span className="pop ring-pulse mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-warning-soft text-warning">
                    <Clock className="h-8 w-8" />
                  </span>
                  <h1 className="enter enter-2 mt-5 text-2xl font-extrabold tracking-tight">Almost there, {form.name.split(" ")[0]}</h1>
                  <p className="mt-2 text-[15px] text-muted">
                    We couldn&apos;t match you to school records automatically, so the <b className="text-text">{campusName(form.campusId)}</b> alumni office will check your details,
                    usually within 2 working days.
                  </p>
                  {result.request.note && <Callout tone="info" className="mt-4">{result.request.note}</Callout>}
                  <div className="mt-5 rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-5 w-5 text-primary" />
                      <p className="font-semibold">Faster: ask two batchmates to vouch</p>
                    </div>
                    <p className="mt-1.5 text-[14px] text-muted">Verified alumni from your batch can confirm they know you. Two vouches verify you.</p>
                    <div className="mt-3 flex gap-2">
                      <Input readOnly value={`vaa.vibgyor.in/vouch/${result.request.id}`} className="font-mono text-[14px]" />
                      <Button
                        variant="secondary"
                        onClick={() => {
                          navigator.clipboard?.writeText(`https://vaa.vibgyor.in/vouch/${result.request.id}`).catch(() => {});
                          setCopied(true);
                        }}
                      >
                        <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <span className="pop ring-pulse mt-6 grid h-16 w-16 place-items-center rounded-2xl bg-success-soft text-success">
                    <PartyPopper className="h-8 w-8" />
                  </span>
                  <h1 className="enter enter-2 mt-5 text-2xl font-extrabold tracking-tight">Welcome back, {form.name.split(" ")[0]}!</h1>
                  <p className="mt-2 text-[15px] text-muted">
                    {result.outcome === "claimed_verified"
                      ? "Your profile is claimed and your verified status, batch and engagement history have been kept."
                      : "Your pass year, admission number and name match school records, so you're verified instantly."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Pill tone="success" icon={<BadgeCheck className="h-3.5 w-3.5" />}>
                      Alumni – Verified
                    </Pill>
                    <Pill>Batch {form.passYear}</Pill>
                    <Pill>{campusName(form.campusId)}</Pill>
                  </div>
                </>
              )}
              <Button
                size="lg"
                className="mt-7 w-full"
                onClick={() => {
                  login(result.userId);
                  router.push("/portal");
                }}
              >
                Continue to the portal <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </Card>
        </Reveal>

        <Reveal delay={120} className="space-y-4">
          <Card className="p-6 shadow-lift">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-success-soft text-success">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <p className="font-bold">How we verify alumni</p>
            </div>
            <p className="mt-1 text-[14px] text-muted">So that students only ever meet real VIBGYOR alumni.</p>
            <ol className="relative mt-6 space-y-6">
              <span className="absolute bottom-4 left-[18px] top-4 w-px bg-border" aria-hidden />
              {[
                { icon: Database, color: "var(--g)", title: "Automatic match", body: "Pass year + admission number + name checked against school records. Instant." },
                { icon: Users, color: "var(--b)", title: "Campus alumni office", body: "If anything differs, your campus checks it with the records side by side." },
                { icon: HeartHandshake, color: "var(--v)", title: "Peer vouch", body: "For older batches without digital records, two verified batchmates can vouch for you." },
              ].map((s, i) => (
                <li key={s.title} className="relative flex gap-3">
                  <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary ring-4 ring-surface">
                    <s.icon className="h-[18px] w-[18px]" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 w-4 place-items-center rounded-full bg-surface text-[11px] font-bold text-text shadow">{i + 1}</span>
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{s.title}</p>
                    <p className="text-[14px] leading-relaxed text-muted">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Callout tone="safe" title="Your privacy">
            You choose who sees your phone, email and location. Data is stored in India under the DPDP Act 2023.
          </Callout>
        </Reveal>
      </main>
      <PublicFooter />
    </>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} type="button" className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold text-muted hover:text-text">
      <ArrowLeft className="h-3.5 w-3.5" /> Back
    </button>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5">
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{value}</dd>
    </div>
  );
}

const progressSteps = [
  { label: "Start", icon: Sparkles },
  { label: "Details", icon: User },
  { label: "Verify", icon: MailCheck },
  { label: "Done", icon: BadgeCheck },
];
const stepIndex: Record<Step, number> = { start: 0, claim: 1, found: 1, details: 1, otp: 2, result: 3 };

function Progress({ step }: { step: Step }) {
  const at = stepIndex[step];
  return (
    <ol className="flex items-center gap-1.5" aria-label="Progress">
      {progressSteps.map((p, i) => {
        const done = i < at;
        const current = i === at;
        return (
          <li key={p.label} className="flex items-center gap-1.5">
            <span
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold transition-all duration-300",
                done && "bg-success-soft text-success",
                current && "bg-primary text-primary-fg shadow-card",
                !done && !current && "bg-surface-2 text-muted"
              )}
              aria-current={current ? "step" : undefined}
            >
              {done ? <Check className="h-3.5 w-3.5" /> : <p.icon className="h-3.5 w-3.5" />}
              <span className={cn(!current && "hidden sm:inline")}>{p.label}</span>
            </span>
            {i < progressSteps.length - 1 && (
              <span className={cn("h-0.5 w-3 rounded-full transition-colors duration-300 sm:w-5", i < at ? "bg-success" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
