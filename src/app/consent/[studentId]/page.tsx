"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, FileText, Lock, MessageSquareText, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { Avatar, Button, Callout, Card, Checkbox, Input, Logo, Pill, Req, Switch } from "@/components/ui";
import { ThemeToggle } from "@/components/Public";
import { campusName, consentPurposes, NOTICE_VERSION } from "@/lib/data";
import { hasConsent, useStore } from "@/lib/store";
import type { ConsentPurpose } from "@/lib/types";
import { cn, firstName, maskMobile } from "@/lib/utils";
import { DemoOtpFill } from "@/components/DemoOtpFill";

type Step = "intro" | "otp" | "choose" | "done";

export default function ParentConsentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const { state, hydrated, sendOtp, checkOtp, grantConsents, login } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [choices, setChoices] = useState<Record<ConsentPurpose, boolean>>({ platform: true, mentor: false, mcz: false });
  const [guardian, setGuardian] = useState(false);

  if (!hydrated) return null;
  const stu = state.users.find((u) => u.id === studentId);
  const parent = stu?.parentIds?.[0] ? state.users.find((u) => u.id === stu.parentIds![0]) : undefined;

  if (!stu || !parent) {
    return (
      <Shell>
        <Card className="p-8 text-center">
          <p className="font-semibold">This link is no longer valid.</p>
          <p className="mt-1 text-sm text-muted">Please ask your child&apos;s campus for a new consent link.</p>
        </Card>
      </Shell>
    );
  }

  const sn = firstName(stu.name);
  const already = hasConsent(state, stu.id, "platform") && step !== "done";
  const otpKey = `consent:${stu.id}`;
  const steps: Step[] = ["intro", "otp", "choose", "done"];
  const stepIdx = steps.indexOf(step);

  if (already) {
    return (
      <Shell>
        <Card className="p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success">
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-xl font-bold">Consent already recorded</h1>
          <p className="mt-2 text-sm text-muted">You can review or withdraw each permission from your Parent portal at any time.</p>
          <Button
            className="mt-6"
            onClick={() => {
              login(parent.id);
              router.push("/portal/consent");
            }}
          >
            Open consent centre
          </Button>
        </Card>
      </Shell>
    );
  }

  return (
    <Shell>
      {/* progress */}
      <div className="mb-5 flex items-center gap-2" aria-label={`Step ${stepIdx + 1} of 4`}>
        {["About", "Verify", "Choose", "Done"].map((l, i) => (
          <div key={l} className="flex flex-1 flex-col gap-1.5">
            <div className={cn("h-1.5 rounded-full", i <= stepIdx ? "bg-primary" : "bg-border")} />
            <span className={cn("text-[12px] font-semibold", i <= stepIdx ? "text-text" : "text-muted")}>{l}</span>
          </div>
        ))}
      </div>

      {step === "intro" && (
        <Card className="animate-in overflow-hidden">
          <div className="bg-primary-soft/60 p-6">
            <div className="flex items-center gap-1.5">
              <Req ids="CS-2" /> <Req ids="A9" />
            </div>
            <h1 className="mt-3 text-[22px] font-bold leading-snug tracking-tight">Dear {firstName(parent.name)}, we need your permission</h1>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
              {sn}&apos;s campus has invited {sn} to the VIBGYOR Alumni Platform. Because {sn} is under 18, the account stays switched off until you say yes.
            </p>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <Avatar name={stu.name} size={44} />
              <div className="min-w-0">
                <p className="font-semibold">{stu.name}</p>
                <p className="text-[14px] text-muted">
                  Class {stu.className} · {campusName(stu.campusIds[0])}
                </p>
              </div>
            </div>
            <p className="mt-6 text-[14px] font-semibold uppercase tracking-wider text-muted">What you should know</p>
            <ul className="mt-3 space-y-3.5">
              {[
                { icon: UserRound, t: "Your child only talks to approved alumni mentors, never the full alumni directory." },
                { icon: Eye, t: "Every message is recorded and can be seen by the campus alumni office." },
                { icon: Lock, t: "Phone numbers, emails and social media handles are hidden automatically." },
                { icon: ShieldCheck, t: "No advertising or tracking is ever shown to your child." },
              ].map((x) => (
                <li key={x.t} className="flex gap-3 text-[14px] leading-relaxed">
                  <x.icon className="mt-0.5 h-[18px] w-[18px] shrink-0 text-primary" /> {x.t}
                </li>
              ))}
            </ul>
            <Callout tone="info" className="mt-6">
              To make sure it&apos;s really you, we&apos;ll send a code to the mobile number the school has on record: <b>{maskMobile(parent.mobile)}</b>
            </Callout>
            <Button
              size="lg"
              className="mt-5 w-full"
              onClick={() => {
                sendOtp(otpKey, `${parent.name} · ${maskMobile(parent.mobile)}`, parent.id, `consent for ${stu.name}`);
                setStep("otp");
              }}
            >
              <Smartphone className="h-4 w-4" /> Send code to my mobile
            </Button>
            <p className="mt-3 text-center text-[13px] text-muted">Not the right number? Contact the school office to update it.</p>
          </div>
        </Card>
      )}

      {step === "otp" && (
        <Card className="animate-in p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary">
            <MessageSquareText className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-[22px] font-bold tracking-tight">Enter the code</h1>
          <p className="mt-1 text-[14px] text-muted">Sent by SMS to {maskMobile(parent.mobile)}. It expires in 10 minutes.</p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (checkOtp(otpKey, code)) {
                setErr("");
                setStep("choose");
              } else setErr("That code isn't right. Please try again.");
            }}
          >
            <Input inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="h-14 text-center font-mono text-2xl tracking-[0.5em]" autoFocus aria-label="6-digit code" />
            {err && <p className="text-[14px] font-medium text-danger">{err}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={code.length !== 6}>
              Verify
            </Button>
            <button
              type="button"
              className="w-full text-[14px] font-semibold text-primary"
              onClick={() => sendOtp(otpKey, `${parent.name} · ${maskMobile(parent.mobile)}`, parent.id, `consent for ${stu.name}`)}
            >
              Resend code
            </button>
            <DemoOtpFill otpKey={otpKey} onFill={(c) => { setCode(c); setErr(""); }} />
            <p className="text-center text-[13px] text-muted">Demo: the latest SMS is also at the top of the device simulator.</p>
          </form>
        </Card>
      )}

      {step === "choose" && (
        <Card className="animate-in p-6">
          <div className="flex items-center gap-1.5">
            <Req ids="CS-3" />
          </div>
          <h1 className="mt-3 text-[22px] font-bold tracking-tight">Choose what {sn} can do</h1>
          <p className="mt-1 text-[14px] text-muted">Each permission is separate. You can change any of them later from your Parent portal, with immediate effect.</p>
          <div className="mt-6 space-y-3">
            {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => {
              const c = consentPurposes[p];
              return (
                <div key={p} className={cn("rounded-2xl border p-4 transition-colors", choices[p] ? "border-primary/50 bg-primary-soft/40" : "border-border")}>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{c.title}</p>
                        {c.required ? <Pill tone="primary">Needed for the account</Pill> : <Pill>Optional</Pill>}
                      </div>
                      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{c.body}</p>
                    </div>
                    <Switch
                      label={c.title}
                      checked={choices[p]}
                      onChange={(v) => setChoices((s) => ({ ...s, [p]: v, ...(p === "platform" && !v ? { mentor: false, mcz: false } : {}) }))}
                      disabled={p !== "platform" && !choices.platform}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {!choices.platform && (
            <Callout tone="warning" className="mt-4">
              Without this, {sn}&apos;s account stays switched off. You can come back to this link at any time.
            </Callout>
          )}
          <div className="mt-5 rounded-xl bg-surface-2 p-4">
            <Checkbox checked={guardian} onChange={setGuardian} label={`I am ${sn}'s parent or legal guardian`} description="Your choice, the time, and this notice version are recorded as proof of consent." />
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[13px] text-muted">
            <FileText className="h-3.5 w-3.5" /> Notice {NOTICE_VERSION}
          </div>
          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={!guardian}
            onClick={() => {
              if (choices.platform) grantConsents(stu.id, parent.id, choices);
              setStep("done");
            }}
          >
            {choices.platform ? "Confirm my choices" : "Save without switching on"} <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {step === "done" && (
        <Card className="animate-in p-6 text-center sm:p-8">
          <span className={cn("mx-auto grid h-14 w-14 place-items-center rounded-2xl", choices.platform ? "bg-success-soft text-success" : "bg-surface-2 text-muted")}>
            <CheckCircle2 className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-[22px] font-bold tracking-tight">{choices.platform ? `Thank you. ${sn}'s account is on.` : "Saved. The account stays off."}</h1>
          <p className="mx-auto mt-2 max-w-sm text-[14px] text-muted">We&apos;ve sent a confirmation to your WhatsApp. Here&apos;s what you agreed to:</p>
          <div className="mx-auto mt-5 max-w-sm space-y-2 text-left">
            {(Object.keys(consentPurposes) as ConsentPurpose[]).map((p) => (
              <div key={p} className="flex items-center justify-between rounded-xl border border-border px-3.5 py-2.5 text-[14.5px]">
                <span className="font-medium">{consentPurposes[p].short}</span>
                {choices[p] ? <Pill tone="success">Allowed</Pill> : <Pill>Not allowed</Pill>}
              </div>
            ))}
          </div>
          <Button
            size="lg"
            className="mt-7 w-full max-w-sm"
            onClick={() => {
              login(parent.id);
              router.push("/portal/consent");
            }}
          >
            Go to my Parent portal
          </Button>
        </Card>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="spectrum h-[3px]" />
        <div className="mx-auto flex h-14 max-w-xl items-center justify-between px-4">
          <Logo />
          <ThemeToggle />
        </div>
      </header>
      <main className="mx-auto max-w-xl px-4 py-8 pb-28">{children}</main>
    </div>
  );
}
