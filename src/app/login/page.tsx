"use client";
/* eslint-disable @next/next/no-img-element -- static export with images.unoptimized */

import { check, clean, whenFilled } from "@/lib/validate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign, ChevronRight, KeyRound, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Enter, EnterItem, Reveal } from "@/components/motion";
import { Avatar, Button, Field, Input, Logo, LogoTiles, Modal, Pill, Req, Tabs } from "@/components/ui";
import { personas, roleLabels, STAFF_ROLES } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { maskMobile } from "@/lib/utils";
import { DemoOtpFill } from "@/components/DemoOtpFill";
import { Emoji, photo, type EmojiName } from "@/components/Emoji";
import { Backdrop, EmojiSticker, LEAF, PillEyebrow, Underlined } from "@/components/Funk";

const groups: { title: string; roles: string[] }[] = [
  { title: "Students & parents", roles: ["STU", "PAR"] },
  { title: "Alumni", roles: ["ALU", "ALP"] },
  { title: "Staff & partners · 2-factor", roles: ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"] },
];

const trust: { emoji: EmojiName; label: string; body: string }[] = [
  { emoji: "phone", label: "One-time codes", body: "By SMS in India, by email overseas." },
  { emoji: "shield", label: "Two-factor for staff", body: "Every admin action is recorded in the audit log." },
  { emoji: "lock", label: "Data stored in India", body: "Handled under the DPDP Act 2023." },
];

export default function LoginPage() {
  const { state, login, sendOtp, checkOtp } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [id, setId] = useState("");
  // Onboarding links from the alumni office carry ?id=<login id>, so the field is pre-filled.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("id");
    if (q) setId(q);
  }, []);
  const [step, setStep] = useState<"id" | "code">("id");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [pending, setPending] = useState<User | null>(null);
  const [tfa, setTfa] = useState("");

  const finish = (u: User) => {
    if (STAFF_ROLES.includes(u.role)) {
      setPending(u);
      setTfa("");
      return;
    }
    login(u.id);
    router.push("/portal");
  };

  const findUser = (q: string) => {
    const n = q.trim().toLowerCase().replace(/\s/g, "");
    if (!n) return undefined;
    if (n.includes("@")) return state.users.find((u) => u.email.toLowerCase() === n);
    // match on the last 10 digits, so "9820045210", "+91 98200 45210" and "09820045210" all work
    const digits = n.replace(/\D/g, "").slice(-10);
    if (digits.length < 10) return undefined;
    return state.users.find((u) => u.mobile.replace(/\D/g, "").slice(-10) === digits);
  };

  const submitId = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    const u = findUser(id);
    if (!u) {
      setErr("We couldn't find that email or mobile. Try a demo account on the right.");
      return;
    }
    if (u.deactivated) {
      setErr("This account has been switched off. Please contact your campus alumni office.");
      return;
    }
    if (mode === "password") {
      finish(u);
      return;
    }
    const overseas = !u.mobile.startsWith("+91");
    sendOtp(`login:${u.id}`, overseas ? u.email : maskMobile(u.mobile), u.id, "signing in");
    setStep("code");
  };

  const submitCode = (e: React.FormEvent) => {
    e.preventDefault();
    const u = findUser(id);
    if (u && checkOtp(`login:${u.id}`, code)) finish(u);
    else setErr("That code isn't right. Check the device simulator (bottom right).");
  };

  return (
    <>
      <div className="min-h-screen lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Brand panel — desktop only */}
        <aside className="sticky top-0 hidden h-screen flex-col justify-between bg-navy p-10 text-white lg:flex xl:p-12">
          <Link href="/" className="flex items-center gap-3" aria-label="VIBGYOR Alumni Association home">
            <LogoTiles size="sm" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/70">Alumni Association</span>
          </Link>
          <Enter className="max-w-md">
            <EnterItem className="relative mb-8">
              <Backdrop invert />
              <div className={`relative overflow-hidden ${LEAF} shadow-lg`}>
                <img src={photo("hero-graduation")} alt="" className="aspect-[16/9] w-full object-cover" />
              </div>
              <EmojiSticker name="wave" size={30} className="absolute -left-3 -top-3 -rotate-12 text-text" />
              <EmojiSticker name="key" size={26} className="absolute -bottom-3 right-8 rotate-12 text-text" />
            </EnterItem>
            <EnterItem>
              <PillEyebrow emoji="key" invert>Sign in</PillEyebrow>
            </EnterItem>
            <EnterItem as="h1" className="mt-4 text-4xl font-semibold text-white">
              Welcome back to the <Underlined>VIBGYOR family.</Underlined>
            </EnterItem>
            <EnterItem as="p" className="mt-4 text-base text-white/70">
              No passwords to remember: we send you a one-time code.
            </EnterItem>
            <EnterItem>
              <ul className="mt-8 grid grid-cols-3 gap-2.5">
                {trust.map((t, i) => (
                  <li
                    key={t.label}
                    title={t.body}
                    className={`flex flex-col items-start gap-2 rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10 transition-transform duration-300 hover:rotate-0 ${
                      i % 2 ? "rotate-1" : "-rotate-1"
                    }`}
                  >
                    <Emoji name={t.emoji} size={30} />
                    <span className="text-sm font-semibold leading-snug">{t.label}</span>
                  </li>
                ))}
              </ul>
            </EnterItem>
          </Enter>
          <p className="text-xs text-white/50">Prototype for RFQ v1.0 · sample data only</p>
        </aside>

        {/* Form column */}
        <div className="flex min-h-screen flex-col">
          <div className="flex h-[var(--header-h)] items-center justify-between gap-4 px-4 sm:px-8">
            <div className="lg:invisible">
              <Logo />
            </div>
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-muted sm:inline">New here?</span>
              <Button href="/join" variant="ghost" size="sm">
                Join as alumni
              </Button>
              <ThemeToggle />
            </div>
          </div>

          <main className="flex flex-1 flex-col items-center px-4 pb-16 pt-8 sm:px-8 lg:pt-16">
            <Enter className="w-full max-w-[420px]">
              <EnterItem className="flex items-center justify-between gap-3">
                <h2 className="text-3xl font-semibold">{step === "id" ? "Sign in" : "Enter your code"}</h2>
                <span className="flex gap-1">
                  <Req ids="A3" /> <Req ids="A13" />
                </span>
              </EnterItem>
              <EnterItem as="p" className="mt-2 text-sm text-muted">
                {step === "id" ? "Use the email or mobile number your school or alumni office has on file." : "We've sent a 6-digit code. In this demo it appears in the device simulator, bottom right."}
              </EnterItem>

              <EnterItem className="mt-8">
                <Tabs
                  tabs={[
                    { id: "otp", label: "One-time code" },
                    { id: "password", label: "Password" },
                  ]}
                  value={mode}
                  onChange={(v) => {
                    setMode(v);
                    setStep("id");
                    setErr("");
                  }}
                />
                {step === "id" ? (
                  <form key="id" onSubmit={submitId} className="animate-in mt-6 space-y-4">
                    <Field label="Email or mobile number" htmlFor="id" error={whenFilled(id, check.emailOrMobile(id))} hint={mode === "otp" ? "Indian mobiles get the code by SMS; overseas users by email." : undefined}>
                      <Input id="id" icon={<AtSign />} value={id} invalid={!!whenFilled(id, check.emailOrMobile(id))} onChange={(e) => setId(clean.emailOrMobile(e.target.value))} placeholder="+91 98200 45210 or you@example.com" autoComplete="username" autoFocus />
                    </Field>
                    {mode === "password" && (
                      <Field label="Password" htmlFor="pw">
                        <Input id="pw" icon={<Lock />} type="password" defaultValue="demo-password" autoComplete="current-password" />
                      </Field>
                    )}
                    {err && (
                      <p className="animate-in text-sm font-medium text-danger" role="alert">
                        {err}
                      </p>
                    )}
                    <Button type="submit" size="lg" className="w-full" disabled={!!check.emailOrMobile(id)}>
                      {mode === "otp" ? "Send code" : "Sign in"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <form key="code" onSubmit={submitCode} className="animate-in mt-6 space-y-4">
                    <Field label="6-digit code" htmlFor="code">
                      <Input id="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
                    </Field>
                    {err && (
                      <p className="animate-in text-sm font-medium text-danger" role="alert">
                        {err}
                      </p>
                    )}
                    <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
                      Verify and sign in
                    </Button>
                    {findUser(id) && <DemoOtpFill otpKey={`login:${findUser(id)!.id}`} onFill={(c) => { setCode(c); setErr(""); }} />}
                    <button type="button" className="ds-interactive w-full rounded-lg py-2 text-sm font-medium text-muted hover:text-text" onClick={() => setStep("id")}>
                      Use a different email or mobile
                    </button>
                  </form>
                )}
              </EnterItem>

              <EnterItem as="p" className="mt-8 border-t border-border pt-6 text-sm leading-relaxed text-muted">
                <span className="font-medium text-text">Students and parents don&apos;t sign up.</span> Your school creates the account from school records; a parent gives consent before a student account opens.
              </EnterItem>
            </Enter>

            {/* Demo accounts */}
            <Reveal className="mt-16 w-full max-w-[640px]">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Demo accounts</h2>
                  <p className="mt-1 text-sm text-muted">One click signs in. Staff accounts ask for a second factor.</p>
                </div>
                <Pill tone="warning">Demo only</Pill>
              </div>
              <div className="mt-4 space-y-6">
                {groups.map((g) => (
                  <div key={g.title}>
                    <p className="eyebrow mb-2">{g.title}</p>
                    <ul className="divide-y divide-border overflow-hidden rounded-[var(--card-radius)] border border-border bg-surface">
                      {personas
                        .map((p) => ({ p, u: state.users.find((u) => u.id === p.userId)! }))
                        .filter(({ u }) => u && g.roles.includes(u.role))
                        .map(({ p, u }) => (
                          <li key={u.id}>
                            <button onClick={() => finish(u)} className="ds-interactive group flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2/70">
                              <Avatar name={u.name} size={32} />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                  {u.name} <span className="font-normal text-muted">· {roleLabels[u.role]}</span>
                                </span>
                                <span className="block truncate text-label text-muted">{p.blurb}</span>
                              </span>
                              <ChevronRight className="h-4 w-4 shrink-0 text-subtle transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-text" />
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Reveal>
          </main>
        </div>
      </div>

      <Modal
        open={!!pending}
        onClose={() => setPending(null)}
        title="Two-factor verification"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPending(null)}>
              Cancel
            </Button>
            <Button
              disabled={tfa.length !== 6}
              onClick={() => {
                if (!pending) return;
                login(pending.id);
                router.push("/portal");
              }}
            >
              Verify
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 p-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-muted" />
            <div className="text-sm">
              <p className="font-semibold">{pending?.name}</p>
              <p className="text-muted">{pending && roleLabels[pending.role]} · staff accounts always use 2-factor</p>
            </div>
          </div>
          <Field label="Code from your authenticator app" htmlFor="tfa" hint="Demo code: 246810">
            <Input id="tfa" inputMode="numeric" maxLength={6} value={tfa} onChange={(e) => setTfa(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
          </Field>
          <button type="button" onClick={() => setTfa("246810")} className="ds-interactive flex items-center gap-2 text-sm font-medium text-link hover:underline">
            <KeyRound className="h-3.5 w-3.5" /> Autofill demo code
          </button>
          <p className="flex items-center gap-2 text-label text-muted">
            <Smartphone className="h-3.5 w-3.5" /> Lost your device? Contact the Super Admin to reset.
          </p>
        </div>
      </Modal>
    </>
  );
}
