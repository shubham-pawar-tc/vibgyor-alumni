"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign, Briefcase, ChevronRight, GraduationCap, Hash, KeyRound, Lock, LogIn, MailCheck, ShieldCheck, Smartphone, Sparkles, UserPlus, Users, type LucideIcon } from "lucide-react";
import { AuthBand, PublicFooter, PublicHeader } from "@/components/Public";
import { Reveal } from "@/components/motion";
import { Avatar, Button, Callout, Card, Field, Input, Modal, Pill, Req, Tabs } from "@/components/ui";
import { personas, roleLabels, STAFF_ROLES } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { maskMobile } from "@/lib/utils";
import { DemoOtpFill } from "@/components/DemoOtpFill";

const groups: { title: string; roles: string[]; icon: LucideIcon; color: string }[] = [
  { title: "Students & parents", roles: ["STU", "PAR"], icon: GraduationCap, color: "var(--g)" },
  { title: "Alumni", roles: ["ALU", "ALP"], icon: Users, color: "var(--r)" },
  { title: "Staff & partners (2-factor)", roles: ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"], icon: Briefcase, color: "var(--b)" },
];

export default function LoginPage() {
  const { state, login, sendOtp, checkOtp } = useStore();
  const router = useRouter();
  const [mode, setMode] = useState<"otp" | "password">("otp");
  const [id, setId] = useState("");
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
      <PublicHeader />
      <AuthBand
        eyebrow="Sign in to VAA"
        eyebrowIcon={LogIn}
        title={<>Welcome back to the <span className="accent-underline">VIBGYOR</span> family</>}
        body="Alumni, students, parents and staff all sign in here. No passwords to remember: we send you a one-time code."
        chips={[
          { icon: Smartphone, label: "OTP by SMS or email", color: "var(--g)" },
          { icon: ShieldCheck, label: "2-factor for staff", color: "var(--b)" },
          { icon: Lock, label: "Data stored in India", color: "var(--v)" },
        ]}
      />
      <main className="relative mx-auto -mt-20 grid max-w-6xl items-start gap-8 px-4 pb-6 sm:px-6 lg:grid-cols-[1fr_1.15fr]">
        <Reveal>
          <Card className="relative overflow-hidden p-6 shadow-lift sm:p-8">
            <div className="flex items-start justify-between gap-3">
              <span className="pop grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-fg shadow-card">
                {step === "id" ? <KeyRound className="h-5 w-5" /> : <MailCheck className="h-5 w-5" />}
              </span>
              <div className="flex items-center gap-1.5">
                <Req ids="A3" /> <Req ids="A13" />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight">{step === "id" ? "Sign in" : "Enter your code"}</h2>
            <p className="mt-1 text-sm text-muted">{step === "id" ? "Sign in with a one-time code or your password." : "Check the device simulator, bottom right."}</p>
            <div className="mt-6">
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
            </div>
            {step === "id" ? (
              <form key="id" onSubmit={submitId} className="animate-in mt-6 space-y-4">
                <Field label="Email or mobile number" htmlFor="id" hint={mode === "otp" ? "Indian mobiles get the code by SMS; overseas users by email." : undefined}>
                  <Input id="id" icon={<AtSign />} value={id} onChange={(e) => setId(e.target.value)} placeholder="+91 98200 45210 or you@example.com" autoComplete="username" />
                </Field>
                {mode === "password" && (
                  <Field label="Password" htmlFor="pw">
                    <Input id="pw" icon={<Lock />} type="password" defaultValue="demo-password" autoComplete="current-password" />
                  </Field>
                )}
                {err && <p className="animate-in text-[14px] font-medium text-danger">{err}</p>}
                <Button type="submit" size="lg" className="w-full">
                  {mode === "otp" ? "Send code" : "Sign in"} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form key="code" onSubmit={submitCode} className="animate-in mt-6 space-y-4">
                <Callout tone="info">We&apos;ve sent a 6-digit code. In this demo it appears in the device simulator.</Callout>
                <Field label="6-digit code" htmlFor="code">
                  <Input id="code" icon={<Hash />} inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
                </Field>
                {err && <p className="text-[14px] font-medium text-danger">{err}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
                  <ShieldCheck className="h-4 w-4" /> Verify &amp; sign in
                </Button>
                {findUser(id) && <DemoOtpFill otpKey={`login:${findUser(id)!.id}`} onFill={(c) => { setCode(c); setErr(""); }} />}
                <button type="button" className="w-full text-[14px] font-medium text-muted" onClick={() => setStep("id")}>
                  Use a different email or mobile
                </button>
              </form>
            )}
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <Callout tone="info" title="Students and parents don't need to sign up">
                Your school creates your account from school records. Students: your parent gets a message to give consent first. Parents: use the mobile number or email registered with the school.
              </Callout>
              <a
                href="/join"
                className="group flex items-center gap-3 rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40 hover:bg-primary-soft/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                  <UserPlus className="h-5 w-5" />
                </span>
                <span className="flex-1">
                  <span className="block text-[14.5px] font-semibold">VIBGYOR alumni, new here?</span>
                  <span className="block text-[13.5px] text-muted">Join or claim your alumni profile</span>
                </span>
                <ArrowRight className="icon-nudge h-4 w-4 text-primary" />
              </a>
            </div>
          </Card>
        </Reveal>

        <Reveal delay={120}>
          <Card className="p-5 shadow-lift sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-lg font-bold">Demo accounts</h2>
                <p className="text-[14px] text-muted">One click signs in. Staff accounts ask for a second factor.</p>
              </div>
            </div>
            <Pill tone="warning">Demo only</Pill>
          </div>
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="mb-2.5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-muted">
                  <g.icon className="h-4 w-4" /> {g.title}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {personas
                    .map((p) => ({ p, u: state.users.find((u) => u.id === p.userId)! }))
                    .filter(({ u }) => u && g.roles.includes(u.role))
                    .map(({ p, u }) => (
                      <button
                        key={u.id}
                        onClick={() => finish(u)}
                        className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-soft/40 hover:shadow-lift"
                      >
                        <Avatar name={u.name} size={38} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-semibold">{u.name}</span>
                          <span className="block truncate text-[13px] text-muted">{roleLabels[u.role]}</span>
                          <span className="block truncate text-[12.5px] text-muted">{p.blurb}</span>
                        </span>
                        <ChevronRight className="icon-nudge h-4 w-4 shrink-0 text-muted group-hover:text-primary" />
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
          </Card>
        </Reveal>
      </main>
      <PublicFooter />

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
          <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div className="text-[14px]">
              <p className="font-semibold">{pending?.name}</p>
              <p className="text-muted">{pending && roleLabels[pending.role]} · staff accounts always use 2-factor</p>
            </div>
          </div>
          <Field label="Code from your authenticator app" htmlFor="tfa" hint="Demo code: 246810">
            <Input id="tfa" inputMode="numeric" maxLength={6} value={tfa} onChange={(e) => setTfa(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
          </Field>
          <button type="button" onClick={() => setTfa("246810")} className="flex items-center gap-1.5 text-[14px] font-semibold text-primary">
            <KeyRound className="h-3.5 w-3.5" /> Autofill demo code
          </button>
          <p className="flex items-center gap-1.5 text-[13px] text-muted">
            <Smartphone className="h-3.5 w-3.5" /> Lost your device? Contact the Super Admin to reset.
          </p>
        </div>
      </Modal>
    </>
  );
}
