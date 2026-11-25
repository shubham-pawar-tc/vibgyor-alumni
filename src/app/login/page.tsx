"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import { PublicHeader } from "@/components/Public";
import { Avatar, Button, Callout, Card, Field, Input, Modal, Pill, Req, Tabs } from "@/components/ui";
import { personas, roleLabels, STAFF_ROLES } from "@/lib/data";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { maskMobile } from "@/lib/utils";
import { DemoOtpFill } from "@/components/DemoOtpFill";

const groups: { title: string; roles: string[] }[] = [
  { title: "Students & parents", roles: ["STU", "PAR"] },
  { title: "Alumni", roles: ["ALU", "ALP"] },
  { title: "Staff & partners (2-factor)", roles: ["TCH", "CAD", "GAO", "FIN", "MCZ", "SAD"] },
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
      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:py-16">
        <div>
          <Card className="p-6 sm:p-8">
            <div className="flex items-center gap-1.5">
              <Req ids="A3" /> <Req ids="A13" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted">Sign in with a one-time code or your password.</p>
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
              <form onSubmit={submitId} className="mt-6 space-y-4">
                <Field label="Email or mobile number" htmlFor="id" hint={mode === "otp" ? "Indian mobiles get the code by SMS; overseas users by email." : undefined}>
                  <Input id="id" value={id} onChange={(e) => setId(e.target.value)} placeholder="+91 98200 45210 or you@example.com" autoComplete="username" />
                </Field>
                {mode === "password" && (
                  <Field label="Password" htmlFor="pw">
                    <Input id="pw" type="password" defaultValue="demo-password" autoComplete="current-password" />
                  </Field>
                )}
                {err && <p className="text-[13px] font-medium text-danger">{err}</p>}
                <Button type="submit" size="lg" className="w-full">
                  {mode === "otp" ? "Send code" : "Sign in"} <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <form onSubmit={submitCode} className="mt-6 space-y-4">
                <Callout tone="info">We&apos;ve sent a 6-digit code. In this demo it appears in the device simulator.</Callout>
                <Field label="6-digit code" htmlFor="code">
                  <Input id="code" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
                </Field>
                {err && <p className="text-[13px] font-medium text-danger">{err}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
                  Verify &amp; sign in
                </Button>
                {findUser(id) && <DemoOtpFill otpKey={`login:${findUser(id)!.id}`} onFill={(c) => { setCode(c); setErr(""); }} />}
                <button type="button" className="w-full text-[13px] font-medium text-muted" onClick={() => setStep("id")}>
                  Use a different email or mobile
                </button>
              </form>
            )}
            <div className="mt-6 space-y-3 border-t border-border pt-5">
              <Callout tone="info" title="Students and parents don't need to sign up">
                Your school creates your account from school records. Students: your parent gets a message to give consent first. Parents: use the mobile number or email registered with the school.
              </Callout>
              <p className="text-center text-[13px] text-muted">
                VIBGYOR alumni, new here?{" "}
                <a href="/join" className="font-semibold text-primary">
                  Join or claim your alumni profile
                </a>
              </p>
            </div>
          </Card>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Demo accounts</h2>
              <p className="text-[13px] text-muted">One click signs in. Staff accounts ask for a second factor.</p>
            </div>
            <Pill tone="warning">Demo only</Pill>
          </div>
          <div className="space-y-5">
            {groups.map((g) => (
              <div key={g.title}>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wider text-muted">{g.title}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {personas
                    .map((p) => ({ p, u: state.users.find((u) => u.id === p.userId)! }))
                    .filter(({ u }) => u && g.roles.includes(u.role))
                    .map(({ p, u }) => (
                      <button
                        key={u.id}
                        onClick={() => finish(u)}
                        className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary-soft/40"
                      >
                        <Avatar name={u.name} size={38} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13.5px] font-semibold">{u.name}</span>
                          <span className="block truncate text-[12px] text-muted">{roleLabels[u.role]}</span>
                          <span className="block truncate text-[11.5px] text-muted">{p.blurb}</span>
                        </span>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

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
            <div className="text-[13px]">
              <p className="font-semibold">{pending?.name}</p>
              <p className="text-muted">{pending && roleLabels[pending.role]} · staff accounts always use 2-factor</p>
            </div>
          </div>
          <Field label="Code from your authenticator app" htmlFor="tfa" hint="Demo code: 246810">
            <Input id="tfa" inputMode="numeric" maxLength={6} value={tfa} onChange={(e) => setTfa(e.target.value.replace(/\D/g, ""))} className="text-center font-mono text-lg tracking-[0.4em]" autoFocus />
          </Field>
          <button type="button" onClick={() => setTfa("246810")} className="flex items-center gap-1.5 text-[13px] font-semibold text-primary">
            <KeyRound className="h-3.5 w-3.5" /> Autofill demo code
          </button>
          <p className="flex items-center gap-1.5 text-[12px] text-muted">
            <Smartphone className="h-3.5 w-3.5" /> Lost your device? Contact the Super Admin to reset.
          </p>
        </div>
      </Modal>
    </>
  );
}
