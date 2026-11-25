"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2, Clock, GraduationCap, ShieldCheck } from "lucide-react";
import { Button, Callout, Card, CardHeader, Checkbox, Field, PageHeader, Pill, Req, Textarea } from "@/components/ui";
import { activeBadge, hasBadge, useStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

const code = [
  "I will keep every conversation with students on the VIBGYOR platform and never ask for or share phone numbers, emails or social media.",
  "I understand all messages with students are recorded and can be reviewed by the campus alumni office.",
  "I will not meet a student in person or by video outside sessions booked through the platform.",
  "I will give honest guidance and never sell or promote paid services to students.",
  "I will report anything that worries me about a student's safety to the campus alumni office straight away.",
  "I understand VIBGYOR can suspend my Mentor badge immediately if this code is broken.",
];

export default function MentorPage() {
  const { me, state, applyBadge } = useStore();
  const [motivation, setMotivation] = useState("");
  const [checks, setChecks] = useState<boolean[]>(code.map(() => false));
  if (!me) return null;

  const badge = hasBadge(me, "Mentor");
  const pending = state.badgeRequests.find((b) => b.userId === me.id && b.badge === "Mentor" && b.status === "pending");
  const allChecked = checks.every(Boolean);

  if (badge) {
    const active = activeBadge(me, "Mentor");
    return (
      <>
        <PageHeader title="Your Mentor badge" eyebrow={<Req ids="CS-9" />} />
        <Card className="max-w-2xl p-6">
          <div className="flex items-center gap-4">
            <span className={active ? "grid h-14 w-14 place-items-center rounded-2xl bg-success-soft text-success" : "grid h-14 w-14 place-items-center rounded-2xl bg-danger-soft text-danger"}>
              <BadgeCheck className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-semibold">{active ? "Active mentor" : "Badge suspended"}</p>
              <p className="text-[13px] text-muted">
                Since {formatDate(badge.since)} · code of conduct accepted {me.codeOfConductAcceptedAt ? formatDate(me.codeOfConductAcceptedAt) : ""}
              </p>
            </div>
          </div>
          {!active && (
            <Callout tone="danger" className="mt-5">
              Your campus alumni office has suspended your badge while they review a report. Students can&apos;t see you until it&apos;s reinstated.
            </Callout>
          )}
        </Card>
      </>
    );
  }

  if (pending) {
    return (
      <>
        <PageHeader title="Mentor request" eyebrow={<Req ids="CS-9" />} />
        <Card className="max-w-2xl p-6">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-warning-soft text-warning">
              <Clock className="h-7 w-7" />
            </span>
            <div>
              <p className="text-lg font-semibold">Waiting for campus approval</p>
              <p className="text-[13px] text-muted">Code of conduct accepted {formatDate(pending.codeAcceptedAt)}. Your Campus Admin will review your request.</p>
            </div>
          </div>
          <Callout tone="info" className="mt-5">
            Demo: switch to <b>Meera Joshi (Campus Admin)</b> → Verification → Badge requests to approve it.
          </Callout>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={<Req ids="CS-9 · §5.2" />}
        title="Become a mentor"
        description="Help VIBGYOR students choose courses, colleges and countries. Students will see your education and current role, never your contact details."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader title="Safeguarding code of conduct" subtitle="Draft wording; VIBGYOR will supply the final text" icon={<ShieldCheck className="h-[18px] w-[18px]" />} />
          <div className="space-y-3.5 p-5">
            {code.map((c, i) => (
              <Checkbox key={i} checked={checks[i]} onChange={(v) => setChecks((s) => s.map((x, j) => (j === i ? v : x)))} label={c} />
            ))}
          </div>
          <div className="border-t border-border p-5">
            <Field label="Why would you like to mentor? (optional)" htmlFor="mot">
              <Textarea id="mot" rows={3} value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="e.g. I'd like to help students interested in product management and Indian B-schools." />
            </Field>
            <Button className="mt-4 w-full sm:w-auto" size="lg" disabled={!allChecked} onClick={() => applyBadge(me.id, "Mentor", motivation)}>
              <GraduationCap className="h-4 w-4" /> Accept code &amp; request badge
            </Button>
          </div>
        </Card>
        <div className="space-y-4">
          <Card className="p-5">
            <p className="font-semibold">What students will see</p>
            <ul className="mt-3 space-y-2.5 text-[13.5px]">
              {["Name and photo", "Batch and campus", "College, course and country", "Current role and company", "Short bio"].map((x) => (
                <li key={x} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success" /> {x}
                </li>
              ))}
              {["Phone, email, social media", "Your location beyond city"].map((x) => (
                <li key={x} className="flex items-center gap-2 text-muted line-through">
                  {x}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="font-semibold">How it works</p>
            <ol className="mt-3 space-y-2 text-[13.5px] text-muted">
              <li>1. Accept the code of conduct</li>
              <li>2. Your Campus Admin approves the badge</li>
              <li>3. Students matched to your path can message you</li>
            </ol>
            <div className="mt-3">
              <Pill tone="primary">Pause any time</Pill>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
